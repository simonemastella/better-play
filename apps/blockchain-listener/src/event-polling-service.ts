import { Subject, concatMap, retry, catchError, EMPTY } from "rxjs";
import { events, db } from "@better-play/database";
import { eq, and, desc } from "drizzle-orm";

import { EventProcessor } from "./event-processor.js";
import {
  EventPayload,
  PollingStrategy,
  EventPollingServiceConfig,
} from "./types/events.js";
import { VeChainEventPoller } from "./vechain-event-poller.js";

export class EventPollingService {
  private eventBus = new Subject<EventPayload>();
  private poller: PollingStrategy;
  private processor: EventProcessor;
  private isRunning = false;

  constructor(private config: EventPollingServiceConfig) {
    this.processor = new EventProcessor();
    const criteriaSet = config.criteriaSet;
    this.poller = new VeChainEventPoller(
      config.network,
      criteriaSet,
      this.eventBus,
      config.pollingInterval || 5000
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log("Starting EventPollingService");

    // Get last processed position
    const startingBlock = await this.getLastProcessedBlock();
    console.log(`Starting from block: ${startingBlock}`);

    // Start polling for events
    this.poller.startPolling(startingBlock);

    // Process events sequentially with RxJS
    this.eventBus
      .pipe(
        concatMap(async (event) => {
          await this.processor.processEvent(event);
        }),
        retry({
          count: this.config.processorOptions?.retryCount || 3,
          delay: this.config.processorOptions?.retryDelay || 1000,
        }),
        catchError((error) => {
          console.log({ error }, "Event processing failed after retries");
          // Continue processing other events
          return EMPTY;
        })
      )
      .subscribe({
        complete: () => console.log("Event bus processing complete"),
        error: (error) => console.log({ error }, "Fatal error in event bus"),
      });

    console.log("EventPollingService started successfully");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log("Stopping EventPollingService");
    this.isRunning = false;

    // Stop polling
    this.poller.stopPolling();

    // Complete the subject
    this.eventBus.complete();
    this.eventBus = new Subject<EventPayload>();

    console.log("EventPollingService stopped");
  }

  private async getLastProcessedBlock(): Promise<number> {
    try {
      // Get the highest block number from events table for lottery contract
      const lastEvent = await db
        .select({ blockNumber: events.blockNumber })
        .from(events)
        .where(eq(events.eventName, "TicketPurchased")) // Or any lottery event
        .orderBy(desc(events.blockNumber))
        .limit(1);

      if (!lastEvent.length) {
        // No processed events, start from configured block
        const startBlock = this.config.startingBlock || 0;
        console.log(
          `No previous events found, starting from configured block ${startBlock}`
        );
        return startBlock;
      }

      // Start from the next block after the last processed one
      const startBlock = Number(lastEvent[0].blockNumber) + 1;
      console.log(
        `Resuming from block: ${startBlock} (last processed: ${lastEvent[0].blockNumber})`
      );
      return startBlock;
    } catch (error) {
      console.log(
        { error },
        "Failed to get last processed block, starting from configured block"
      );
      return this.config.startingBlock || 0;
    }
  }

  private async eventExists(event: EventPayload): Promise<boolean> {
    try {
      const existingEvent = await db
        .select({ txId: events.txId })
        .from(events)
        .where(
          and(eq(events.txId, event.txId), eq(events.logIndex, event.logIndex))
        )
        .limit(1);

      return existingEvent.length > 0;
    } catch (error) {
      console.log(
        {
          error,
          txId: event.txId,
          blockNumber: event.blockNumber,
          logIndex: event.logIndex,
        },
        "Failed to check event existence"
      );
      // On error, assume event doesn't exist to avoid skipping events
      return false;
    }
  }

  getProcessor(): EventProcessor {
    return this.processor;
  }
}
