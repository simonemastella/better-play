import type { ILotteryRepository, IUserRepository } from '../interfaces/repositories.js';
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

  async createRound(data: CreateRoundData): Promise<void> {
    await this.lotteryRepository.createRound(data);
  }

  async processTicketPurchase(data: TicketPurchaseData): Promise<void> {
    await this.database.transaction(async (tx) => {
      // Ensure user exists first
      await this.userRepository.ensureExists(data.buyer, tx);
      
      // Add the ticket
      await this.lotteryRepository.addTicket({
        ticketId: data.ticketId,
        roundId: data.roundId,
        buyer: data.buyer,
        eventTxId: data.txId,
        eventLogIndex: data.logIndex,
      }, tx);
      
      // Update prize pool
      await this.lotteryRepository.increasePrizePool(data.roundId, data.price, tx);
    });
  }

  async processAmountIncrease(data: AmountIncreasedData): Promise<void> {
    await this.lotteryRepository.increasePrizePool(data.roundId, data.amount);
  }

  async processRoundReveal(data: RoundRevealData): Promise<void> {
    // Ensure all winners exist as users
    for (const winner of data.winners) {
      await this.userRepository.ensureExists(winner);
    }
    
    // Mark round as revealed and save winners
    await this.lotteryRepository.revealRound(data);
  }

  // Query methods for API
  async getActiveRounds(): Promise<any[]> {
    return this.lotteryRepository.getActiveRounds();
  }

  async getRoundDetails(roundId: number): Promise<any | null> {
    return this.lotteryRepository.getRoundById(roundId);
  }
}