import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from "@nestjs/common";
import { Redis } from "ioredis";
import { EventsController } from "./events.controller.js";

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubscriberService.name);

  constructor(
    @Inject("REDIS") private redis: Redis,
    private eventsController: EventsController
  ) {
    this.logger.log(
      "RedisSubscriberService constructor called",
      !!eventsController
    );
  }

  async onModuleInit() {
    // Subscribe to blockchain events channel
    await this.redis.subscribe("blockchain.events");

    this.redis.on("message", (channel, message) => {
      try {
        const eventData = JSON.parse(message);
        this.logger.log(`Received event from ${channel}:`, eventData);

        // Debug controller availability
        this.logger.log("EventsController available:", !!this.eventsController);

        // Broadcast to SSE clients
        if (this.eventsController && this.eventsController.broadcastEvent) {
          this.eventsController.broadcastEvent(eventData);
          this.logger.log("Event broadcasted successfully");
        } else {
          this.logger.error(
            "EventsController not available or broadcastEvent method missing"
          );
        }
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
