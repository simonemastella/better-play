import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventService, LotteryService, UserService } from '@better-play/core';
import { CoreModule } from '../core/core.module.js';
import { EventCoordinatorService } from './services/event-coordinator.service.js';
import { EventProcessorService } from './services/event-processor.service.js';
import { VeChainEventPollerService } from './services/vechain-event-poller.service.js';
import { LotteryHandler } from './handlers/lottery.handler.js';
import { XAllocationVotingHandler } from './handlers/xallocation-voting.handler.js';
import type { Database } from '@better-play/database';

@Module({
  imports: [CoreModule],
  providers: [
    // Services (order matters for dependency injection)
    {
      provide: VeChainEventPollerService,
      useFactory: (configService: ConfigService) => new VeChainEventPollerService(configService),
      inject: [ConfigService],
    },
    {
      provide: EventProcessorService,
      useFactory: (configService: ConfigService, eventService: EventService, eventEmitter: EventEmitter2, lotteryHandler: LotteryHandler, xAllocationHandler: XAllocationVotingHandler, database: Database) =>
        new EventProcessorService(configService, eventService, eventEmitter, lotteryHandler, xAllocationHandler, database),
      inject: [ConfigService, EventService, EventEmitter2, LotteryHandler, XAllocationVotingHandler, 'DATABASE'],
    },
    {
      provide: EventCoordinatorService,
      useFactory: (configService: ConfigService, eventProcessor: EventProcessorService, veChainPoller: VeChainEventPollerService, eventService: EventService) =>
        new EventCoordinatorService(configService, eventProcessor, veChainPoller, eventService),
      inject: [ConfigService, EventProcessorService, VeChainEventPollerService, EventService],
    },
    
    // Event Handlers
    {
      provide: LotteryHandler,
      useFactory: (lotteryService: LotteryService, userService: UserService) =>
        new LotteryHandler(lotteryService, userService),
      inject: [LotteryService, UserService],
    },
    XAllocationVotingHandler,
  ],
  exports: [
    EventCoordinatorService,
    EventProcessorService,
  ],
})
export class BlockchainModule {}