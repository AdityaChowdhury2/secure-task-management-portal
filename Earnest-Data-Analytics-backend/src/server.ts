import { Server } from "http";
import app from "./app";
import config from "./app/config";
import prisma from "./app/config/prisma";
import { createServer } from "node:http";

let server: ReturnType<typeof createServer>;
server = createServer(app);

const removeOldListeners = () => {
  server.removeAllListeners("error");
  server.removeAllListeners("listening");
};

const tryListen = (port: number) => {
  // 🧹 remove old event listeners before retry
  removeOldListeners();

  // Try to listen on the specified port
  server.once("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use, trying port ${port + 1}...`);
      setTimeout(() => {
        tryListen(port + 1);
      }, 1000);
    } else {
      console.error(err);
      process.exit(1);
    }
  });

  // If listening is successful, log the port
  server.once("listening", () => {
    console.log(`✅ Assignment API listening on port ${port}`);
  });

  // Start listening on the specified port
  server.listen(port);
};

async function main() {
  try {
    // Start BullMQ workers in the same process
    // startAllWorkers();

    // Start Socket.IO server
    // startSocketServer(server);

    // Try to listen on the configured port, or the next available port
    tryListen(config.port);
  } catch (error) {
    console.error(error);

    // Important: exit the process with error code
    process.exit(1);
  }
}

main();

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down...`);
  try {
    // Close BullMQ workers first
    // await shutdownAllWorkers();
    // console.log("✅ BullMQ workers disconnected");

    // Close Socket.IO server
    // shutdownSocketServer();
    // console.log("✅ Socket.IO server disconnected");

    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");

    // ✅ Wrap server.close in a Promise so we can await it
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(1);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", (reason, promise) => {
  console.log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  gracefulShutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.log(`Uncaught Exception: ${error}`);
  gracefulShutdown("uncaughtException");
});
