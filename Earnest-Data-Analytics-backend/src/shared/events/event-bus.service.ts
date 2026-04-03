import { redisClient } from "../../app/config/redisClient";

/**
 * Event Bus Service
 * 
 * Publishes events to Redis pub/sub for cross-instance communication
 */
export class EventBusService {
  /**
   * Publish an event to Redis
   * @param channel - Redis channel name
   * @param event - Event payload
   */
  static async publish<T>(channel: string, event: T): Promise<void> {
    try {
      await redisClient.publish(channel, JSON.stringify(event));
      console.log(`[EventBus] Published event to channel '${channel}':`, event);
    } catch (error) {
      console.error(`[EventBus] Error publishing event to channel '${channel}':`, error);
      throw error;
    }
  }

  /**
   * Publish InvoiceCreatedEvent
   */
  static async publishInvoiceCreated(event: InvoiceCreatedEvent): Promise<void> {
    await this.publish("invoice:created", event);
  }
}

/**
 * Invoice Created Event
 */
export interface InvoiceCreatedEvent {
  invoiceId: string;
  invoiceNumber: string;
  userId: string;
  courseId: string;
  amount: number;
  status: string;
  createdAt: string;
  courseSnapshot: {
    id: string;
    title: string;
    price: number;
  };
  userSnapshot: {
    id: string;
    name: string;
    email: string;
  };
}

