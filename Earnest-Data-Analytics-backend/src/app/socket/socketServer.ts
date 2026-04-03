import HttpStatus from "http-status";
import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../utils/jwtUtils";
import { redisClient } from "../config/redisClient";
import config from "../config";
import { Role } from "@prisma/client";
import * as cookie from "cookie";
import AppError from "../errors/AppError";

let io: IOServer;

/**
 * Socket.IO Server for Real-time Notifications
 *
 * This server handles real-time communication between clients and the server
 * using Socket.IO with Redis pub/sub for scalability across multiple instances.
 *
 * Features:
 * - JWT Authentication for secure connections
 * - Room-based messaging (user-specific and role-based)
 * - Redis pub/sub for cross-instance communication
 * - Automatic reconnection handling
 * - Connection status tracking
 */

// Store connected users for tracking
const connectedUsers = new Map<
  string,
  { userId: string; role: Role; socketId: string }
>();

/**
 * Start the Socket.IO server
 */
export const startSocketServer = (server: HTTPServer) => {
  console.log(config.socket.cors.origin);
  io = new IOServer(server, {
    cors: {
      origin: config.socket.cors.origin,
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  io.use(authenticateSocket);
  io.on("connection", handleSocketConnection);

  startRedisSubscription();

  console.log("[Socket.IO] Initialized on shared HTTP server");
};

/**
 * Authentication middleware
 */
const authenticateSocket: Parameters<IOServer["use"]>[0] = async (
  socket,
  next
) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    console.log("rawToken in socket", cookieHeader);
    if (!cookieHeader)
      return next(
        new AppError(HttpStatus.UNAUTHORIZED, "Authentication token required")
      );

    const cookies = cookie.parse(cookieHeader);
    console.log("cookies in socket", cookies);
    const token = cookies.accessToken;
    console.log("token in socket", token);

    if (!token)
      return next(
        new AppError(HttpStatus.UNAUTHORIZED, "Authentication token missing")
      );

    const decoded = await verifyToken(token);
    if (!decoded)
      return next(new AppError(HttpStatus.UNAUTHORIZED, "Invalid token"));

    socket.data.user = decoded;
    next();
  } catch (err) {
    console.error("[Socket.IO] Auth error:", err);
    next(
      new AppError(HttpStatus.INTERNAL_SERVER_ERROR, "Authentication failed")
    );
  }
};

/**
 * Handle client connections
 */
const handleSocketConnection = async (socket: Socket) => {
  const { userId, role: userRole } = socket.data.user;

  console.log(
    `[Socket.IO] User ${userId} (${userRole}) connected: ${socket.id}`
  );

  connectedUsers.set(socket.id, {
    userId,
    role: userRole,
    socketId: socket.id,
  });

  await socket.join(`user:${userId}`);
  await socket.join(`role:${userRole}`);

  socket.emit("connected", {
    message: "Connected to notification service",
    userId,
    role: userRole,
    timestamp: new Date(),
  });

  try {
    const { notificationService } = await import(
      "../modules/notification/notification.service"
    );
    const stats = await notificationService.getNotificationStats(userId);
    socket.emit("notification_stats", stats);
  } catch (err) {
    console.error("[Socket.IO] Notification stats error:", err);
  }

  socket.on("disconnect", (reason) => {
    console.log(`[Socket.IO] User ${userId} disconnected: ${reason}`);
    connectedUsers.delete(socket.id);
    socket.leave(`user:${userId}`);
    socket.leave(`role:${userRole}`);
  });

  /**
   * Handle notification acknowledgment
   */
  socket.on("mark_notification_read", async (data) => {
    try {
      const { notificationId } = data;
      const { notificationService } = await import(
        "../modules/notification/notification.service"
      );

      await notificationService.markAsRead(notificationId, userId);

      // Update notification stats
      const stats = await notificationService.getNotificationStats(userId);
      socket.emit("notification_stats", stats);

      socket.emit("notification_marked_read", {
        notificationId,
        success: true,
      });
    } catch (error) {
      console.error("[Socket.IO] Error marking notification as read:", error);
      socket.emit("notification_marked_read", {
        notificationId: data.notificationId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * Handle mark all notifications as read
   */
  socket.on("mark_all_notifications_read", async () => {
    try {
      const { notificationService } = await import(
        "../modules/notification/notification.service"
      );

      await notificationService.markAllAsRead(userId);

      // Update notification stats
      const stats = await notificationService.getNotificationStats(userId);
      socket.emit("notification_stats", stats);

      socket.emit("all_notifications_marked_read", { success: true });
    } catch (error) {
      console.error(
        "[Socket.IO] Error marking all notifications as read:",
        error
      );
      socket.emit("all_notifications_marked_read", {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * Handle notification deletion
   */
  socket.on("delete_notification", async (data) => {
    try {
      const { notificationId } = data;
      const { notificationService } = await import(
        "../modules/notification/notification.service"
      );

      await notificationService.deleteNotification(notificationId, userId);

      // Update notification stats
      const stats = await notificationService.getNotificationStats(userId);
      socket.emit("notification_stats", stats);

      socket.emit("notification_deleted", { notificationId, success: true });
    } catch (error) {
      console.error("[Socket.IO] Error deleting notification:", error);
      socket.emit("notification_deleted", {
        notificationId: data.notificationId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  socket.on("error", (err) => {
    console.error(`[Socket.IO] Socket error (${userId}):`, err);
  });
};

/**
 * Redis subscriber for cross-instance notification broadcasting
 */
const startRedisSubscription = () => {
  const subscriber = redisClient.duplicate();

  subscriber.subscribe("notifications", (err) => {
    if (err) {
      console.error("[Socket.IO] Redis subscribe failed:", err);
    } else {
      console.log("[Socket.IO] Subscribed to Redis 'notifications'");
    }
  });

  subscriber.on("message", async (channel, message) => {
    if (channel === "notifications") {
      try {
        const notification = JSON.parse(message);
        const { notificationService } = await import(
          "../modules/notification/notification.service"
        );
        await notificationService.sendToConnectedClients(notification);
      } catch (err) {
        console.error("[Socket.IO] Failed to process Redis message:", err);
      }
    }
  });

  // Store reference for shutdown
  (io as any)._redisSubscriber = subscriber;
};

/**
 * Shutdown Socket.IO and Redis
 */
export const shutdownSocketServer = () => {
  console.log("[Socket.IO] Shutting down...");

  const subscriber = (io as any)._redisSubscriber;
  if (subscriber) {
    subscriber.unsubscribe();
    subscriber.quit();
  }

  io?.close(() => {
    console.log("[Socket.IO] Server closed");
  });
};

/**
 * Get stats on connected users
 */
export const getConnectedUsersStats = () => {
  const stats = {
    total: connectedUsers.size,
    byRole: {} as Record<string, number>,
  };

  for (const user of connectedUsers.values()) {
    stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
  }

  return stats;
};

/**
 * Export io for other modules (optional)
 */
export const getSocketIO = () => io;
