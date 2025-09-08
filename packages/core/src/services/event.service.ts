import type { IEventRepository } from '../interfaces/repositories.js';
import type { ProcessedEvent } from '../types/event.types.js';
import type { Database } from '@better-play/database';

type TransactionClient = Parameters<Parameters<Database['transaction']>[0]>[0];

export class EventService {
  constructor(private eventRepository: IEventRepository) {}

  async saveProcessedEvent(
    event: ProcessedEvent, 
    payload: { 
      txId: string; 
      logIndex: number; 
      blockNumber: number; 
    },
    tx?: TransactionClient
  ): Promise<void> {
    await this.eventRepository.save({
      txId: payload.txId,
      logIndex: payload.logIndex,
      eventName: event.eventName,
      blockNumber: payload.blockNumber,
      decoded: event.decoded,
    }, tx);
  }

  async eventExists(txId: string, logIndex: number): Promise<boolean> {
    return this.eventRepository.exists(txId, logIndex);
  }

  async getLastProcessedEvent(): Promise<{ blockNumber: number; txId: string; eventName: string } | null> {
    return this.eventRepository.getLastProcessedEvent();
  }
}