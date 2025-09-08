import { eq, sql } from 'drizzle-orm';
import { rounds, tickets, users, winners as winnersTable, type Database } from '@better-play/database';
import type { ILotteryRepository } from '../interfaces/repositories.js';
import type { CreateRoundData, CreateTicketData, RoundRevealData } from '../types/lottery.types.js';

type TransactionClient = Parameters<Parameters<Database['transaction']>[0]>[0];

export class LotteryRepository implements ILotteryRepository {
  constructor(private database: Database) {}

  async createRound(data: CreateRoundData, tx?: TransactionClient): Promise<void> {
    const db = tx || this.database;
    await db.insert(rounds).values({
      roundId: data.roundId,
      ticketPrice: data.ticketPrice,
      prizes: data.prizes,
      endBlock: data.endBlock,
    });
  }

  async addTicket(data: CreateTicketData, tx?: TransactionClient): Promise<void> {
    const db = tx || this.database;
    await db.insert(tickets).values({
      ticketId: data.ticketId,
      roundId: data.roundId,
      buyer: data.buyer,
      eventTxId: data.eventTxId,
      eventLogIndex: data.eventLogIndex,
    });
  }

  async increasePrizePool(roundId: number, amount: number, tx?: TransactionClient): Promise<void> {
    const db = tx || this.database;
    await db
      .update(rounds)
      .set({
        prizePool: sql`${rounds.prizePool} + ${amount}`,
      })
      .where(eq(rounds.roundId, roundId));
  }

  async revealRound(data: RoundRevealData): Promise<void> {
    await this.database.transaction(async (tx) => {
      // Mark round as revealed
      await tx
        .update(rounds)
        .set({ revealed: true })
        .where(eq(rounds.roundId, data.roundId));

      // Save all winners if any
      if (data.winners.length > 0) {
        await tx.insert(winnersTable).values(
          data.winners.map((winner, index) => ({
            roundId: data.roundId,
            position: index + 1,
            winner: winner.toLowerCase(),
            prizeWon: data.prizes[index],
          }))
        );
      }
    });
  }

  async getActiveRounds(): Promise<any[]> {
    return this.database
      .select()
      .from(rounds)
      .where(eq(rounds.revealed, false));
  }

  async getRoundById(roundId: number): Promise<any | null> {
    const result = await this.database
      .select()
      .from(rounds)
      .where(eq(rounds.roundId, roundId))
      .limit(1);
    
    return result[0] || null;
  }
}