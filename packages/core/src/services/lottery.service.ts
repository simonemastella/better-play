import { eq, sql } from 'drizzle-orm';
import { rounds } from '@better-play/database';
import type { ILotteryRepository, IUserRepository, EventData } from '../interfaces/repositories.js';
import type { 
  TicketPurchaseData, 
  CreateRoundData, 
  RoundRevealData, 
  AmountIncreasedData 
} from '../types/lottery.types.js';
import type { Database } from '@better-play/database';

type TransactionClient = Parameters<Parameters<Database['transaction']>[0]>[0];

export class LotteryService {
  constructor(
    private lotteryRepository: ILotteryRepository,
    private userRepository: IUserRepository,
    private database: Database
  ) {}

  async createRound(data: CreateRoundData, eventData: EventData): Promise<void> {
    await this.lotteryRepository.createRound(data, eventData);
  }

  async processTicketPurchase(data: TicketPurchaseData, eventData: EventData): Promise<void> {
    await this.database.transaction(async (tx) => {
      // Ensure user exists first
      await this.userRepository.ensureExists(data.buyer, tx);
      
      // Add the ticket (this will save the TicketPurchased event)
      await this.lotteryRepository.addTicket({
        ticketId: data.ticketId,
        roundId: data.roundId,
        buyer: data.buyer,
        eventTxId: data.txId,
        eventLogIndex: data.logIndex,
      }, eventData, tx);
      
      // Update prize pool without saving event (since it's part of the ticket purchase)
      await tx
        .update(rounds)
        .set({
          prizePool: sql`${rounds.prizePool} + ${data.price}`,
        })
        .where(eq(rounds.roundId, data.roundId));
    });
  }

  async processAmountIncrease(data: AmountIncreasedData, eventData: EventData): Promise<void> {
    await this.lotteryRepository.increasePrizePool(data.roundId, data.amount, eventData);
  }

  async processRoundReveal(data: RoundRevealData, eventData: EventData): Promise<void> {
    // Ensure all winners exist as users
    for (const winner of data.winners) {
      await this.userRepository.ensureExists(winner);
    }
    
    // Mark round as revealed and save winners
    await this.lotteryRepository.revealRound(data, eventData);
  }

  // Query methods for API
  async getActiveRounds(): Promise<any[]> {
    return this.lotteryRepository.getActiveRounds();
  }

  async getRoundDetails(roundId: number): Promise<any | null> {
    return this.lotteryRepository.getRoundById(roundId);
  }

  async getTicketCount(): Promise<number> {
    return this.lotteryRepository.getTicketCount();
  }
}