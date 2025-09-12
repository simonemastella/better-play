import { eq, and, desc, count } from "drizzle-orm";
import { events, type Database } from "@better-play/database";
import type { IEventRepository } from "../interfaces/repositories.js";
import { Redis } from "ioredis";

type TransactionClient = Parameters<Parameters<Database["transaction"]>[0]>[0];

export class EventRepository implements IEventRepository {
  private readonly TX_COUNT_KEY = "blockchain:tx_count";

  constructor(private database: Database, private redis: Redis) {}

  async save(
    event: {
      txId: string;
      logIndex: number;
      eventName: string;
      blockNumber: number;
      decoded: Record<string, any>;
    },
    tx?: TransactionClient
  ): Promise<void> {
    const db = tx || this.database;
    await db.insert(events).values({
      txId: event.txId,
      logIndex: event.logIndex,
      eventName: event.eventName,
      blockNumber: event.blockNumber,
      decoded: event.decoded,
    });

    // 🚀 Increment transaction count in Redis
    if (!(await this.redis.get(this.TX_COUNT_KEY)))
      await this.redis.incr(this.TX_COUNT_KEY);
  }

  async exists(txId: string, logIndex: number): Promise<boolean> {
    const existingEvent = await this.database
      .select({ txId: events.txId })
      .from(events)
      .where(and(eq(events.txId, txId), eq(events.logIndex, logIndex)))
      .limit(1);

    return existingEvent.length > 0;
  }

  async getLastProcessedEvent(): Promise<{
    blockNumber: number;
    txId: string;
    eventName: string;
  } | null> {
    const lastEvent = await this.database
      .select({
        blockNumber: events.blockNumber,
        txId: events.txId,
        eventName: events.eventName,
      })
      .from(events)
      .orderBy(desc(events.blockNumber), desc(events.txId))
      .limit(1);

    return lastEvent.length > 0 ? lastEvent[0] : null;
  }

  async getTransactionCount(): Promise<number> {
    // Try Redis cache first
    const cachedCount = await this.redis.get(this.TX_COUNT_KEY);
    if (cachedCount) {
      return parseInt(cachedCount, 10);
    }

    // Cache miss - query database
    const result = await this.database
      .select({ count: count() })
      .from(events);
    
    const dbCount = result[0].count;

    // Cache the result in Redis
    await this.redis.set(this.TX_COUNT_KEY, dbCount.toString());

    return dbCount;
  }
}
