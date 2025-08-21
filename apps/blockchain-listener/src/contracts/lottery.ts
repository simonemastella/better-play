import { Interface } from "ethers";
import { EventPayload } from "../types/events.js";
import type { TypedEventLog } from "packages/contracts/dist/typechain-types/common.js";
import type {
  AmountIncreasedEvent,
  NextRoundDetailsUpdatedEvent,
  PrizeClaimedEvent,
  RoleGrantedEvent,
  RoleRevokedEvent,
  RoundCreatedEvent,
  RoundRevealedEvent,
  TicketPurchasedEvent,
} from "packages/contracts/dist/typechain-types/contracts/Lottery.js";
import type { ProcessedEvent } from "./xallocation-voting.js";
import { Lottery__factory } from "packages/contracts/dist/typechain-types/index.js";
import { db, rounds } from "@better-play/database";

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

type LotteryEventName = Extract<
  (typeof Lottery__factory.abi)[number],
  { type: "event" }
>["name"];

// Event handler function type (can be sync or async)
type EventHandler = (
  parsed: any,
  tx: TransactionClient
) => ProcessedEvent | null | Promise<ProcessedEvent | null>;

export class Lottery {
  private static eventHandlers: Partial<
    Record<LotteryEventName, EventHandler>
  > = {
    RoundCreated: Lottery.handleRoundCreated,
    TicketPurchased: Lottery.handleTicketPurchased,
    AmountIncreased: Lottery.handleAmountIncreased,
    NextRoundDetailsUpdated: Lottery.handleNextRoundDetailsUpdated,
    RoundRevealed: Lottery.handleRoundRevealed,
    PrizeClaimed: Lottery.handlePrizeClaimed,
    RoleGranted: Lottery.handleRoleGranted,
    RoleRevoked: Lottery.handleRoleRevoked,
  };

  static async processEvent(
    payload: EventPayload,
    iface: Interface,
    tx: TransactionClient
  ): Promise<ProcessedEvent | null> {
    console.log(`[Lottery] received at block ${payload.blockNumber}`);
    const parsed = iface.parseLog(payload.raw);
    if (!parsed) {
      console.error(
        `Failed to parse Lottery event: ${payload.txId} index: ${payload.logIndex}`
      );
      return null;
    }

    console.log(`[Lottery] ${parsed.name} at block ${payload.blockNumber}`);

    const handler = this.eventHandlers[parsed.name as LotteryEventName];
    if (!handler) {
      console.log(`  Unhandled Lottery event: ${parsed.name}`);
      return null;
    }

    // Pass the parsed log and transaction to the handler
    return handler(parsed as any, tx);
  }

  private static async handleRoundCreated(
    parsed: TypedEventLog<RoundCreatedEvent.Event>,
    tx: TransactionClient
  ): Promise<ProcessedEvent> {
    const { roundId, ticketPrice, prizes, endBlock } = parsed.args;
    console.log("  Round created:", {
      roundId: roundId.toString(),
      ticketPrice: ticketPrice.toString(),
      prizes: prizes.map((p) => p.toString()),
      endBlock: endBlock.toString(),
    });

    // Save round to database using transaction
    try {
      await tx.insert(rounds).values({
        roundId: Number(roundId),
        ticketPrice: Number(ticketPrice),
        prizes: prizes.map((p) => Number(p)),
        endBlock: Number(endBlock),
      });
      console.log(`  Round ${roundId} saved to database`);
    } catch (error) {
      console.error(`  Failed to save round ${roundId} to database:`, error);
      throw error; // Throw to trigger transaction rollback
    }

    return {
      eventName: "RoundCreated",
      decoded: {
        roundId: roundId.toString(),
        ticketPrice: ticketPrice.toString(),
        prizes: prizes.map((p) => p.toString()),
        endBlock: endBlock.toString(),
      },
    };
  }

  private static handleTicketPurchased(
    parsed: TypedEventLog<TicketPurchasedEvent.Event>,
    _tx: TransactionClient
  ): ProcessedEvent {
    const { ticketId, buyer, roundId, price } = parsed.args;
    console.log("  Ticket purchased:", {
      ticketId: ticketId.toString(),
      buyer,
      roundId: roundId.toString(),
      price: price.toString(),
    });

    return {
      eventName: "TicketPurchased",
      decoded: {
        ticketId: ticketId.toString(),
        buyer,
        roundId: roundId.toString(),
        price: price.toString(),
      },
    };
  }

  private static handleAmountIncreased(
    parsed: TypedEventLog<AmountIncreasedEvent.Event>,
    _tx: TransactionClient
  ): ProcessedEvent {
    const { roundId, amount } = parsed.args;
    console.log("  Amount increased:", {
      roundId: roundId.toString(),
      amount: amount.toString(),
    });

    return {
      eventName: "AmountIncreased",
      decoded: {
        roundId: roundId.toString(),
        amount: amount.toString(),
      },
    };
  }

  private static handleNextRoundDetailsUpdated(
    parsed: TypedEventLog<NextRoundDetailsUpdatedEvent.Event>,
    _tx: TransactionClient
  ): ProcessedEvent {
    const { oldPrice, newPrice, newPrizes } = parsed.args;
    console.log("  Next round details updated:", {
      oldPrice: oldPrice.toString(),
      newPrice: newPrice.toString(),
      newPrizes: newPrizes.map((p) => p.toString()),
    });

    return {
      eventName: "NextRoundDetailsUpdated",
      decoded: {
        oldPrice: oldPrice.toString(),
        newPrice: newPrice.toString(),
        newPrizes: newPrizes.map((p) => p.toString()),
      },
    };
  }

  private static handleRoundRevealed(
    parsed: TypedEventLog<RoundRevealedEvent.Event>,
    _tx: TransactionClient
  ): ProcessedEvent {
    const { roundId, winners, prizes, totalPrize } = parsed.args;
    console.log("  Round revealed:", {
      roundId: roundId.toString(),
      winners,
      prizes: prizes.map((p) => p.toString()),
      totalPrize: totalPrize.toString(),
    });

    return {
      eventName: "RoundRevealed",
      decoded: {
        roundId: roundId.toString(),
        winners,
        prizes: prizes.map((p) => p.toString()),
        totalPrize: totalPrize.toString(),
      },
    };
  }

  private static handlePrizeClaimed(
    parsed: TypedEventLog<PrizeClaimedEvent.Event>,
    _tx: TransactionClient
  ): ProcessedEvent {
    const { roundId, winner, amount } = parsed.args;
    console.log("  Prize claimed:", {
      roundId: roundId.toString(),
      winner,
      amount: amount.toString(),
    });

    return {
      eventName: "PrizeClaimed",
      decoded: {
        roundId: roundId.toString(),
        winner,
        amount: amount.toString(),
      },
    };
  }

  private static handleRoleGranted(
    parsed: TypedEventLog<RoleGrantedEvent.Event>,
    _tx: TransactionClient
  ): ProcessedEvent {
    const { role, account, sender } = parsed.args;
    console.log("  Role granted:", {
      role,
      account,
      sender,
    });

    return {
      eventName: "RoleGranted",
      decoded: {
        role,
        account,
        sender,
      },
    };
  }

  private static handleRoleRevoked(
    parsed: TypedEventLog<RoleRevokedEvent.Event>,
    _tx: TransactionClient
  ): ProcessedEvent {
    const { role, account, sender } = parsed.args;
    console.log("  Role revoked:", {
      role,
      account,
      sender,
    });

    return {
      eventName: "RoleRevoked",
      decoded: {
        role,
        account,
        sender,
      },
    };
  }
}
