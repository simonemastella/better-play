import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from "@nestjs/common";
import { Redis } from "ioredis";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubscriberService.name);

  constructor(
    @Inject("REDIS") private redis: Redis,
    private eventEmitter: EventEmitter2
  ) {
    this.logger.log("RedisSubscriberService constructor called");
  }

  async onModuleInit() {
    // Subscribe to blockchain events channel
    await this.redis.subscribe("blockchain.events");

    this.redis.on("message", (channel, message) => {
      try {
        const eventData = JSON.parse(message);
        this.logger.log(`Received event from ${channel}:`, eventData);

        // Emit semantic events based on event type
        const eventType = eventData.type || "blockchain.unknown";
        this.eventEmitter.emit(eventType, eventData);
      } catch (error) {
        this.logger.error("Error processing Redis message:", error);
      }
    });

    this.redis.on("error", (error) => {
      this.logger.error("Redis connection error:", error);
    });

    this.redis.on("connect", () => {
      this.logger.log("Connected to Redis");
    });

    this.logger.log("Redis subscriber initialized");
  }

  async onModuleDestroy() {
    // Don't quit here - Redis connection is managed by DI container
    this.logger.log("Redis subscriber service destroyed");
  }
}
