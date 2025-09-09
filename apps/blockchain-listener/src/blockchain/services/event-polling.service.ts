import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject, concatMap, retry, catchError, EMPTY, type Subscription } from 'rxjs';
import type { Configuration } from '../../config/configuration.js';
import { EventProcessorService } from './event-processor.service.js';
import { VeChainEventPollerService } from './vechain-event-poller.service.js';
import { EventService } from '@better-play/core';
import type { EventPayload } from '../types/event.types.js';

@Injectable()
export class EventPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPollingService.name);
  private eventBus = new Subject<EventPayload>();
  private subscription?: Subscription;
  private isRunning = false;

  constructor(
    private configService: ConfigService<Configuration>,
    private eventProcessor: EventProcessorService,
    private veChainPoller: VeChainEventPollerService,
    private eventService: EventService
  ) {}

  async onModuleInit() {
    await this.start();
    
    // Log health status every 30 seconds
    setInterval(() => {
      const inFlight = this.eventProcessor.getInFlightCount();
      if (inFlight > 0) {
        this.logger.log(`📊 Status: ${inFlight} events in-flight`);
      } else {
        this.logger.debug(`💤 Status: idle (0 events in-flight)`);
      }
    }, 30000);
  }

  async onModuleDestroy() {
    await this.stop();
  }

  private async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.logger.log('🚀 Starting Event Polling Service');

    // Initialize the VeChain poller with criteria from event processor
    const criteriaSet = this.eventProcessor.getCriteria();
    this.veChainPoller.setCriteriaSet(criteriaSet);
    
    // Set the event processor for backpressure monitoring
    this.veChainPoller.setEventProcessor(this.eventProcessor);

    // Get last processed position
    const startingBlock = await this.getLastProcessedBlock();
    this.logger.log(`📍 Starting from block: ${startingBlock}`);

    // Start polling for events
    this.veChainPoller.startPolling(startingBlock, this.eventBus);

    // Process events sequentially with RxJS
    this.subscription = this.eventBus
      .pipe(
        concatMap(async (event) => {
          await this.eventProcessor.processEvent(event);
        }),
        retry({
          count: 3,
          delay: 1000,
        }),
        catchError((error) => {
          this.logger.error('💥 Event processing failed after retries', error);
          // Continue processing other events
          return EMPTY;
        })
      )
      .subscribe({
        complete: () => this.logger.log('📋 Event bus processing complete'),
        error: (error) => this.logger.error('💀 Fatal error in event bus', error),
      });

    this.logger.log('✅ Event Polling Service started successfully');
  }

  private async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logger.log('🛑 Stopping Event Polling Service');
    this.isRunning = false;

    // Stop polling
    this.veChainPoller.stopPolling();

    // Unsubscribe from RxJS subscription to prevent memory leaks
    this.subscription?.unsubscribe();
    this.subscription = undefined;

    // Complete the subject
    this.eventBus.complete();
    this.eventBus = new Subject<EventPayload>();

    this.logger.log('✅ Event Polling Service stopped');
  }

  private async getLastProcessedBlock(): Promise<number> {
    try {
      const lastEvent = await this.eventService.getLastProcessedEvent();
      
      if (lastEvent) {
        this.logger.log(`🔄 Resuming from block ${lastEvent.blockNumber} (last processed event: ${lastEvent.eventName}, tx: ${lastEvent.txId})`);
        return lastEvent.blockNumber;
      }
      
      // No events processed yet, start from configured block
      const startingBlock = this.configService.get('blockchain.startingBlock', { infer: true }) || 0;
      this.logger.log(`🆕 No previous events found, starting from configured block ${startingBlock}`);
      return startingBlock;
    } catch (error) {
      this.logger.error('❌ Failed to get last processed block, falling back to configured block', error);
      return this.configService.get('blockchain.startingBlock', { infer: true }) || 0;
    }
  }
}