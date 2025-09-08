export interface ProcessedEvent {
  eventName: string;
  decoded: Record<string, any>;
}

export interface EventPayload {
  blockNumber: number;
  blockTimestamp: number;
  logIndex: number;
  clauseIndex: number;
  txId: string;
  txOrigin: string;
  contractAddress: string;
  raw: any;
}