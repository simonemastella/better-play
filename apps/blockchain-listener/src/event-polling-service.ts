import { Subject, concatMap, retry, catchError, EMPTY, type Subscription } from "rxjs";
import { events, db } from "@better-play/database";
import { eq, desc } from "drizzle-orm";
import { EventCriteria } from "@vechain/sdk-network";

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
  private subscription?: Subscription;

  constructor(private config: EventPollingServiceConfig) {
    this.processor = new EventProcessor();

    // Get criteriaSet from EventProcessor (includes topic filters)
    const criteriaSet: EventCriteria[] = this.processor.getCriteria();

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
    this.subscription = this.eventBus
      .pipe(
        concatMap(async (event) => {
          await this.processor.processEvent(event);
        }),
        retry({
          count: this.config.pollerOptions?.retryCount || 3,
          delay: this.config.pollerOptions?.retryDelay || 1000,
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

    // Unsubscribe from RxJS subscription to prevent memory leaks
    this.subscription?.unsubscribe();
    this.subscription = undefined;

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

  getProcessor(): EventProcessor {
    return this.processor;
  }
}
