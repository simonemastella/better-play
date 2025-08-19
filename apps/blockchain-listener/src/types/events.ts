import { EventCriteria, EventLogs } from "@vechain/sdk-network";
import { LogDescription } from "ethers";
import { Subject } from "rxjs";

export interface EventPayload {
  blockNumber: number;
  blockTimestamp: number;
  logIndex: number;
  clauseIndex: number;
  txId: string;
  txOrigin: string;
  contractAddress: string;
  raw: EventLogs;
}

export interface PollingStrategy {
  startPolling(fromBlock: number): Promise<void>;
  stopPolling(): void;
  setCriteria(criteriaSet: any[]): void;
}

export interface EventHandler {
  canHandle(event: LogDescription): boolean;
  process(payload: EventPayload): Promise<void>;
}

export interface PostEventAction {
  eventType: string;
  execute(payload: EventPayload): Promise<void>;
}

export interface EventProcessorOptions {
  retryCount?: number;
  retryDelay?: number;
  batchSize?: number;
}

export interface EventPollingServiceConfig {
  criteriaSet: EventCriteria[];
  network: "mainnet" | "testnet";
  startingBlock?: number;
  pollingInterval?: number;
  processorOptions?: EventProcessorOptions;
}
