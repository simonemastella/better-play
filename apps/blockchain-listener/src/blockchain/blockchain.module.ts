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
      useFactory: (configService: ConfigService, lotteryHandler: LotteryHandler, xAllocationHandler: XAllocationVotingHandler) =>
        new EventProcessorService(configService, lotteryHandler, xAllocationHandler),
      inject: [ConfigService, LotteryHandler, XAllocationVotingHandler],
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
      useFactory: (lotteryService: LotteryService, userService: UserService, eventEmitter: EventEmitter2) =>
        new LotteryHandler(lotteryService, userService, eventEmitter),
      inject: [LotteryService, UserService, EventEmitter2],
    },
    {
      provide: XAllocationVotingHandler,
      useFactory: (eventService: EventService, eventEmitter: EventEmitter2) =>
        new XAllocationVotingHandler(eventService, eventEmitter),
      inject: [EventService, EventEmitter2],
    },
  ],
  exports: [
    EventCoordinatorService,
    EventProcessorService,
  ],
})
export class BlockchainModule {}