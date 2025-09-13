import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventService } from '@better-play/core';
import type { EventPayload, ProcessedEvent } from '../types/event.types.js';

@Injectable()
export class XAllocationVotingHandler {
  private readonly logger = new Logger(XAllocationVotingHandler.name);

  constructor(
    private eventService: EventService,
    private eventEmitter: EventEmitter2
  ) {}

  async processEvent(
    parsed: any,
    payload: EventPayload
  ): Promise<ProcessedEvent | null> {
    this.logger.debug(`🗳️ [XAllocationVoting] received at block ${payload.blockNumber}`);
    this.logger.log(`🗳️ [XAllocationVoting] ${parsed.name} at block ${payload.blockNumber}`);

    // For now, just log and return the processed event
    // In the future, you can add specific handlers for different XAllocationVoting events
    const processedEvent = {
      eventName: parsed.name,
      decoded: Object.fromEntries(
        parsed.args.map((arg: unknown, index: number) => [
          parsed.fragment.inputs[index].name,
          typeof arg === 'bigint' ? arg.toString() : arg
        ])
      ),
    };

    // Save the event to the database
    await this.eventService.saveProcessedEvent(processedEvent, {
      txId: payload.txId,
      logIndex: payload.logIndex,
      blockNumber: payload.blockNumber,
    });
    this.logger.log(`✅ XAllocationVoting event ${parsed.name} saved to database`);

    // 🚀 Emit event for Redis publishing (comment out the next 3 lines to disable)
    this.eventEmitter.emit(`xallocation.${parsed.name.toLowerCase()}`, {
      ...processedEvent.decoded,
      blockNumber: payload.blockNumber,
    });

    return processedEvent;
  }
}