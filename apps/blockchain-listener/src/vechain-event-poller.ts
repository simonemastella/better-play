import { ethers } from "ethers";
import { Subject } from "rxjs";

import {
  ThorClient,
  SimpleHttpClient,
  MAINNET_URL,
  TESTNET_URL,
  EventCriteria,
} from "@vechain/sdk-network";

import { EventPayload, PollingStrategy } from "./types/events.js";

export class VeChainEventPoller implements PollingStrategy {
  private client: ThorClient;
  private isPolling = false;
  private pollingTimeout?: NodeJS.Timeout;
  private consecutiveFailures = 0;

  constructor(
    network: "mainnet" | "testnet",
    private criteriaSet: EventCriteria[],
    private eventBus: Subject<EventPayload>,
    private pollingInterval: number = 5000
  ) {
    const nodeUrl = network === "mainnet" ? MAINNET_URL : TESTNET_URL;
    const httpClient = new SimpleHttpClient(nodeUrl);
    this.client = new ThorClient(httpClient);

    console.log(
      {
        network,
        nodeUrl,
      },
      "VeChain event poller initialized"
    );
    console.log(this.criteriaSet);
  }

  async startPolling(fromBlock: number): Promise<void> {
    this.isPolling = true;
    let nextBlock = fromBlock;

    while (this.isPolling) {
      try {
        const { toBlock } = await this.fetchEvents(nextBlock);

        // Reset failure counter on success
        if (this.consecutiveFailures > 0) {
          console.log(
            `Event polling recovered after ${this.consecutiveFailures} failures`
          );
          this.consecutiveFailures = 0;
        }

        // Next fetch starts from where we left off
        nextBlock = toBlock;

        // Wait before next poll
        await this.sleep(this.pollingInterval);
      } catch (error: any) {
        this.consecutiveFailures++;
        console.error(
          `Event polling error (attempt ${this.consecutiveFailures}):`,
          error?.message || error
        );

        // Exponential backoff: 1x, 2x, 4x, 8x polling interval
        const backoffMultiplier = Math.min(
          2 ** (this.consecutiveFailures - 1),
          8
        );
        const delayMs = this.pollingInterval * backoffMultiplier;
        await this.sleep(delayMs);
      }
    }
  }

  stopPolling(): void {
    this.isPolling = false;

    if (this.pollingTimeout) {
      clearTimeout(this.pollingTimeout);
    }

    this.consecutiveFailures = 0;
  }

  private async fetchEvents(fromBlock: number): Promise<{ toBlock: number }> {
    // Get current best block to determine range
    const bestBlock = await this.cancellable(
      this.client.blocks.getBestBlockCompressed()
    );
    if (!bestBlock) {
      return { toBlock: fromBlock };
    }

    // Convert block ref to number (first 8 hex chars after 0x)
    const toBlock = bestBlock.number;

    console.log(`Fetching events from block ${fromBlock} to ${toBlock}`);

    // Don't process beyond current block
    if (fromBlock > toBlock) {
      return { toBlock };
    }

    // Fetch events in batches with pagination
    const batchSize = 1_000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const eventLogs = await this.cancellable(
        this.client.logs.filterRawEventLogs({
          range: { unit: "block", from: fromBlock, to: toBlock },
          options: { limit: batchSize, offset, includeIndexes: true } as any,
          criteriaSet: this.criteriaSet,
          order: "asc",
        })
      );

      if (eventLogs.length === 0) {
        hasMore = false;
        break;
      }

      let block;
      // Process each event log
      for (const eventLog of eventLogs) {
        if (!block || block.number !== eventLog.meta.blockNumber) {
          block = await this.cancellable(
            this.client.blocks.getBlockExpanded(eventLog.meta.blockNumber)
          );
          if (!block) {
            console.warn(
              `Block ${eventLog.meta.blockNumber} not found, skipping event`
            );
            continue;
          }
        }
        const clauseIdx = eventLog.meta?.clauseIndex ?? 0;
        const logIdx = //shitty docs and returned types, thor gives this back actually
          (eventLog as any).meta?.logIndex ?? (eventLog as any).logIndex ?? 0;
        this.eventBus.next({
          blockNumber: eventLog.meta.blockNumber,
          blockTimestamp: block.timestamp,
          logIndex: logIdx,
          clauseIndex: clauseIdx,
          txId: eventLog.meta.txID,
          txOrigin: eventLog.meta.txOrigin.toLocaleLowerCase(),
          contractAddress: eventLog.address.toLowerCase(),
          raw: eventLog,
        });
      }

      offset += eventLogs.length;
      hasMore = eventLogs.length === batchSize;
    }

    return { toBlock };
  }

  private cancellable<T>(promise: Promise<T>): Promise<T> {
    if (!this.isPolling) {
      return Promise.reject(new Error("Operation aborted"));
    }
    return promise;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.pollingTimeout = setTimeout(resolve, ms);
    });
  }
}
