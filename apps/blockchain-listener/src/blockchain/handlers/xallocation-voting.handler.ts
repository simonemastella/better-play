import { Injectable, Logger } from '@nestjs/common';
import type { EventPayload, ProcessedEvent } from '../types/event.types.js';

@Injectable()
export class XAllocationVotingHandler {
  private readonly logger = new Logger(XAllocationVotingHandler.name);

  async processEvent(
    parsed: any,
    payload: EventPayload
  ): Promise<ProcessedEvent | null> {
    this.logger.debug(`🗳️ [XAllocationVoting] received at block ${payload.blockNumber}`);
    this.logger.log(`🗳️ [XAllocationVoting] ${parsed.name} at block ${payload.blockNumber}`);

    // For now, just log and return the processed event
    // In the future, you can add specific handlers for different XAllocationVoting events
    return {
      eventName: parsed.name,
      decoded: Object.fromEntries(
        parsed.args.map((arg: unknown, index: number) => [
          parsed.fragment.inputs[index].name,
          typeof arg === 'bigint' ? arg.toString() : arg
        ])
      ),
    };
  }
}