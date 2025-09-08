import type { CreateRoundData, CreateTicketData, RoundRevealData, RoleGrantedData, RoleRevokedData } from '../types/lottery.types.js';
import type { Database } from '@better-play/database';

type TransactionClient = Parameters<Parameters<Database['transaction']>[0]>[0];

export interface ILotteryRepository {
  createRound(data: CreateRoundData, tx?: TransactionClient): Promise<void>;
  addTicket(data: CreateTicketData, tx?: TransactionClient): Promise<void>;
  increasePrizePool(roundId: number, amount: number, tx?: TransactionClient): Promise<void>;
  revealRound(data: RoundRevealData): Promise<void>;
  getActiveRounds(): Promise<any[]>;
  getRoundById(roundId: number): Promise<any | null>;
}

export interface IUserRepository {
  ensureExists(address: string, tx?: TransactionClient): Promise<void>;
  grantRole(data: RoleGrantedData, tx?: TransactionClient): Promise<void>;
  revokeRole(data: RoleRevokedData, tx?: TransactionClient): Promise<void>;
  getUserByAddress(address: string): Promise<any | null>;
}

export interface IEventRepository {
  save(event: { 
    txId: string; 
    logIndex: number; 
    eventName: string; 
    blockNumber: number; 
    decoded: Record<string, any> 
  }, tx?: TransactionClient): Promise<void>;
  exists(txId: string, logIndex: number): Promise<boolean>;
  getLastProcessedEvent(): Promise<{ blockNumber: number; txId: string; eventName: string } | null>;
}