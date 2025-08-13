import { EventPayload, EventHandler } from './types/events.js';

export class EventProcessor {
  private handlers: EventHandler[] = [];

  registerHandler(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  async processEvent(payload: EventPayload): Promise<void> {
    console.log(`Processing event from block ${payload.blockNumber}, tx: ${payload.txId}`);
    
    // TODO: Decode event based on contract address and process
    // For now, just log the raw event
    console.log({
      blockNumber: payload.blockNumber,
      txId: payload.txId,
      contractAddress: payload.contractAddress,
      logIndex: payload.logIndex,
      clauseIndex: payload.clauseIndex,
    });
  }
}