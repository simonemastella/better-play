import { EventCriteria, EventLogs } from "@vechain/sdk-network";
import { LogDescription, Interface } from "ethers";
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
}

export interface EventHandler {
  canHandle(event: LogDescription): boolean;
  process(payload: EventPayload): Promise<void>;
}

export interface PostEventAction {
  eventType: string;
  execute(payload: EventPayload): Promise<void>;
}

export interface EventPollerOptions {
  retryCount?: number;
  retryDelay?: number;
  batchSize?: number;
}

export interface EventPollingServiceConfig {
  network: "mainnet" | "testnet";
  startingBlock?: number;
  pollingInterval?: number;
  pollerOptions?: EventPollerOptions;
}
