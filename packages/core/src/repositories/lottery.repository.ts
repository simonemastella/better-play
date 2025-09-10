import { eq, sql } from "drizzle-orm";
import {
  rounds,
  tickets,
  winners as winnersTable,
  type Database,
} from "@better-play/database";
import type {
  ILotteryRepository,
  IEventRepository,
  EventData,
} from "../interfaces/repositories.js";
import type {
  CreateRoundData,
  CreateTicketData,
  RoundRevealData,
} from "../types/lottery.types.js";

type TransactionClient = Parameters<Parameters<Database["transaction"]>[0]>[0];

export class LotteryRepository implements ILotteryRepository {
  constructor(
    private database: Database,
    private eventRepository: IEventRepository
  ) {}

  async createRound(
    data: CreateRoundData,
    eventData: EventData,
    tx?: TransactionClient
  ): Promise<void> {
    const execute = async (txClient: TransactionClient) => {
      await txClient.insert(rounds).values({
        roundId: data.roundId,
        ticketPrice: data.ticketPrice,
        prizes: data.prizes,
        endBlock: data.endBlock,
      });

      await this.eventRepository.save(
        {
          txId: eventData.txId,
          logIndex: eventData.logIndex,
          eventName: "RoundCreated",
          blockNumber: eventData.blockNumber,
          decoded: eventData.decoded,
        },
        txClient
      );
    };

    tx ? await execute(tx) : await this.database.transaction(execute);
  }

  async addTicket(
    data: CreateTicketData,
    eventData: EventData,
    tx?: TransactionClient
  ): Promise<void> {
    const execute = async (txClient: TransactionClient) => {
      await txClient.insert(tickets).values({
        ticketId: data.ticketId,
        roundId: data.roundId,
        buyer: data.buyer,
        eventTxId: data.eventTxId,
        eventLogIndex: data.eventLogIndex,
      });

      await this.eventRepository.save(
        {
          txId: eventData.txId,
          logIndex: eventData.logIndex,
          eventName: "TicketPurchased",
          blockNumber: eventData.blockNumber,
          decoded: eventData.decoded,
        },
        txClient
      );
    };

    tx ? await execute(tx) : await this.database.transaction(execute);
  }

  async increasePrizePool(
    roundId: number,
    amount: number,
    eventData: EventData,
    tx?: TransactionClient
  ): Promise<void> {
    const execute = async (txClient: TransactionClient) => {
      await txClient
        .update(rounds)
        .set({
          prizePool: sql`${rounds.prizePool} + ${amount}`,
        })
        .where(eq(rounds.roundId, roundId));

      await this.eventRepository.save(
        {
          txId: eventData.txId,
          logIndex: eventData.logIndex,
          eventName: "AmountIncreased",
          blockNumber: eventData.blockNumber,
          decoded: eventData.decoded,
        },
        txClient
      );
    };

    tx ? await execute(tx) : await this.database.transaction(execute);
  }

  async revealRound(
    data: RoundRevealData,
    eventData: EventData
  ): Promise<void> {
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

      // Save the event
      await this.eventRepository.save(
        {
          txId: eventData.txId,
          logIndex: eventData.logIndex,
          eventName: "RoundRevealed",
          blockNumber: eventData.blockNumber,
          decoded: eventData.decoded,
        },
        tx
      );
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
