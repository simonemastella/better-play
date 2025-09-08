import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import {
  ThorClient,
  SimpleHttpClient,
  MAINNET_URL,
  TESTNET_URL,
  EventCriteria,
} from '@vechain/sdk-network';
import type { Configuration } from '../../config/configuration.js';
import type { EventPayload } from '../types/event.types.js';
import type { EventProcessorService } from './event-processor.service.js';

@Injectable()
export class VeChainEventPollerService {
  private readonly logger = new Logger(VeChainEventPollerService.name);
  private client: ThorClient;
  private isPolling = false;
  private pollingTimeout?: NodeJS.Timeout;
  private consecutiveFailures = 0;
  private pollingInterval: number;
  private criteriaSet: EventCriteria[] = [];

  private eventProcessor?: EventProcessorService;

  constructor(
    private configService: ConfigService<Configuration>
  ) {
    const network = this.configService.get('blockchain.network', { infer: true })!;
    this.pollingInterval = this.configService.get('blockchain.pollingInterval', { infer: true }) || 5000;
    
    const nodeUrl = network === 'mainnet' ? MAINNET_URL : TESTNET_URL;
    const httpClient = new SimpleHttpClient(nodeUrl);
    this.client = new ThorClient(httpClient);

    this.logger.log(`🌐 VeChain event poller initialized for ${network} (${nodeUrl})`);
  }

  startPolling(fromBlock: number, eventBus: Subject<EventPayload>): void {
    this.isPolling = true;
    let nextBlock = fromBlock;

    const poll = async () => {
      if (!this.isPolling) return;

      // Check backpressure - pause if too many events are in-flight
      if (this.eventProcessor) {
        const inFlight = this.eventProcessor.getInFlightCount();
        if (inFlight > 10000) {
          this.logger.warn(`🔒 Backpressure activated: ${inFlight} events in-flight, pausing polling...`);
          this.pollingTimeout = setTimeout(poll, 5000); // Check again in 5 seconds
          return;
        }
      }

      try {
        const { toBlock } = await this.fetchEvents(nextBlock, eventBus);

        // Reset failure counter on success
        if (this.consecutiveFailures > 0) {
          this.logger.log(
            `📡 Event polling recovered after ${this.consecutiveFailures} failures`
          );
          this.consecutiveFailures = 0;
        }

        // Next fetch starts from where we left off
        nextBlock = toBlock;

        // Wait before next poll
        this.pollingTimeout = setTimeout(poll, this.pollingInterval);
      } catch (error: any) {
        this.consecutiveFailures++;
        this.logger.error(
          `💥 Event polling error (attempt ${this.consecutiveFailures}):`,
          error?.message || error
        );

        // Exponential backoff: 1x, 2x, 4x, 8x polling interval
        const backoffMultiplier = Math.min(
          2 ** (this.consecutiveFailures - 1),
          8
        );
        const delayMs = this.pollingInterval * backoffMultiplier;
        
        this.pollingTimeout = setTimeout(poll, delayMs);
      }
    };

    poll();
  }

  stopPolling(): void {
    this.isPolling = false;

    if (this.pollingTimeout) {
      clearTimeout(this.pollingTimeout);
    }

    this.consecutiveFailures = 0;
    this.logger.log('🛑 VeChain event polling stopped');
  }

  private async fetchEvents(fromBlock: number, eventBus: Subject<EventPayload>): Promise<{ toBlock: number }> {
    // Get current best block to determine range
    const bestBlock = await this.cancellable(
      this.client.blocks.getBestBlockCompressed()
    );
    if (!bestBlock) {
      return { toBlock: fromBlock };
    }

    const toBlock = bestBlock.number;
    this.logger.debug(`🔍 Fetching events from block ${fromBlock} to ${toBlock}`);

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
          range: { unit: 'block', from: fromBlock, to: toBlock },
          options: { limit: batchSize, offset, includeIndexes: true } as any,
          criteriaSet: this.criteriaSet,
          order: 'asc',
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
            this.logger.warn(
              `⚠️ Block ${eventLog.meta.blockNumber} not found, skipping event`
            );
            continue;
          }
        }
        
        const clauseIdx = eventLog.meta?.clauseIndex ?? 0;
        const logIdx = (eventLog as any).meta?.logIndex ?? (eventLog as any).logIndex ?? 0;
        
        eventBus.next({
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
      return Promise.reject(new Error('Operation aborted'));
    }
    return promise;
  }

  setCriteriaSet(criteriaSet: EventCriteria[]): void {
    this.criteriaSet = criteriaSet;
    this.logger.log(`📋 Updated criteria set with ${criteriaSet.length} criteria`);
  }

  setEventProcessor(eventProcessor: EventProcessorService): void {
    this.eventProcessor = eventProcessor;
  }
}