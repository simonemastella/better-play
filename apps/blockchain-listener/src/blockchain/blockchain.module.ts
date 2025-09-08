import { Module, OnModuleInit } from '@nestjs/common';
import { EventPollingService } from './services/event-polling.service.js';
import { EventProcessorService } from './services/event-processor.service.js';
import { VeChainEventPollerService } from './services/vechain-event-poller.service.js';
import { LotteryHandler } from './handlers/lottery.handler.js';
import { XAllocationVotingHandler } from './handlers/xallocation-voting.handler.js';
import type { Database } from '@better-play/database';

@Module({
  providers: [
    // Services
    EventPollingService,
    {
      provide: EventProcessorService,
      useFactory: (configService, eventService, eventEmitter, lotteryHandler, xAllocationHandler, database: Database) =>
        new EventProcessorService(configService, eventService, eventEmitter, lotteryHandler, xAllocationHandler, database),
      inject: ['ConfigService', 'EventService', 'EventEmitter2', 'LotteryHandler', 'XAllocationVotingHandler', 'DATABASE'],
    },
    VeChainEventPollerService,
    
    // Event Handlers
    LotteryHandler,
    XAllocationVotingHandler,
  ],
  exports: [
    EventPollingService,
    EventProcessorService,
  ],
})
export class BlockchainModule implements OnModuleInit {
  constructor(
    private eventProcessor: EventProcessorService,
    private veChainPoller: VeChainEventPollerService
  ) {}

  onModuleInit() {
    // Initialize the VeChain poller with criteria from event processor
    const criteriaSet = this.eventProcessor.getCriteria();
    this.veChainPoller.setCriteriaSet(criteriaSet);
    
    // Set the event processor for backpressure monitoring
    this.veChainPoller.setEventProcessor(this.eventProcessor);
  }
}