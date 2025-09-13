import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Redis } from "ioredis";

@Injectable()
export class RedisPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPublisherService.name);

  constructor(@Inject("REDIS") private redis: Redis) {}

  async onModuleInit() {
    this.redis.on("error", (error) => {
      this.logger.error("Redis connection error:", error);
    });

    this.redis.on("connect", () => {
      this.logger.log("Connected to Redis");
    });

    this.logger.log("Redis publisher initialized");
  }

  async onModuleDestroy() {
    // Don't quit here - Redis connection is managed by DI container
    this.logger.log("Redis publisher service destroyed");
  }

  @OnEvent("**")
  async handleAllEvents(payload: any, eventName: string) {
    try {
      const eventData = {
        event: eventName,
        data: payload,
        timestamp: new Date().toISOString(),
        source: "blockchain-listener",
      };

      await this.redis.publish("blockchain.events", JSON.stringify(eventData));
      this.logger.debug(`Published event to Redis: ${eventName}`);
    } catch (error) {
      this.logger.error("Failed to publish event to Redis:", error);
    }
  }
}
