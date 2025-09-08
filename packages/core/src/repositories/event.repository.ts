import { eq, and, desc } from 'drizzle-orm';
import { events, type Database } from '@better-play/database';
import type { IEventRepository } from '../interfaces/repositories.js';

type TransactionClient = Parameters<Parameters<Database['transaction']>[0]>[0];

export class EventRepository implements IEventRepository {
  constructor(private database: Database) {}

  async save(event: {
    txId: string;
    logIndex: number;
    eventName: string;
    blockNumber: number;
    decoded: Record<string, any>;
  }, tx?: TransactionClient): Promise<void> {
    const db = tx || this.database;
    await db.insert(events).values({
      txId: event.txId,
      logIndex: event.logIndex,
      eventName: event.eventName,
      blockNumber: event.blockNumber,
      decoded: event.decoded,
    });
  }

  async exists(txId: string, logIndex: number): Promise<boolean> {
    try {
      const existingEvent = await this.database
        .select({ txId: events.txId })
        .from(events)
        .where(
          and(
            eq(events.txId, txId),
            eq(events.logIndex, logIndex)
          )
        )
        .limit(1);

      return existingEvent.length > 0;
    } catch (error) {
      console.error(
        `Failed to check event existence for ${txId}:${logIndex}:`,
        error
      );
      // On error, assume event doesn't exist to avoid skipping events
      return false;
    }
  }

  async getLastProcessedEvent(): Promise<{ blockNumber: number; txId: string; eventName: string } | null> {
    try {
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
    } catch (error) {
      console.error('Failed to get last processed event:', error);
      return null;
    }
  }
}