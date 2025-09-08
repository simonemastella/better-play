import { Interface } from "ethers";
import { EventPayload } from "../types/events.js";
import type { TypedEventLog } from "@better-play/contracts";
import type {
  AmountIncreasedEvent,
  NextRoundDetailsUpdatedEvent,
  RoleGrantedEvent,
  RoleRevokedEvent,
  RoundCreatedEvent,
  RoundRevealedEvent,
  TicketPurchasedEvent,
} from "@better-play/contracts";
import type { ProcessedEvent } from "./xallocation-voting.js";
import { Lottery__factory } from "@better-play/contracts";
import {
  db,
  rounds,
  tickets,
  users,
  userRoles,
  UserRoleType,
  winners as winnersTable,
} from "@better-play/database";
import { eq, sql, and } from "drizzle-orm";

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];
type LotteryEventName = Extract<
  (typeof Lottery__factory.abi)[number],
  { type: "event" }
>["name"];

// Event handler function type (can be sync or async)
type EventHandler = (
  parsed: any,
  tx: TransactionClient,
  payload: EventPayload
) => ProcessedEvent | null | Promise<ProcessedEvent | null>;

// Map role bytes32 hashes to role names
const ROLE_MAPPING: Record<string, UserRoleType> = {
  "0x0000000000000000000000000000000000000000000000000000000000000000":
    "DEFAULT_ADMIN_ROLE",
  "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929":
    "OPERATOR_ROLE",
  "0x3496e2e73c4d42b75d702e60d9e48102720b8691234415963a5a857b86425d07":
    "TREASURER_ROLE",
  "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a":
    "PAUSER_ROLE",
};

export class Lottery {
  private static eventHandlers: Partial<
    Record<LotteryEventName, EventHandler>
  > = {
    RoundCreated: Lottery.handleRoundCreated,
    TicketPurchased: Lottery.handleTicketPurchased,
    AmountIncreased: Lottery.handleAmountIncreased,
    NextRoundDetailsUpdated: Lottery.handleNextRoundDetailsUpdated,
    RoundRevealed: Lottery.handleRoundRevealed,
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

    // Pass the parsed log, transaction, and payload to the handler
    return handler(parsed as any, tx, payload);
  }

  private static async handleRoundCreated(
    parsed: TypedEventLog<RoundCreatedEvent.Event>,
    tx: TransactionClient,
    _payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { roundId, ticketPrice, prizes, endBlock } = parsed.args;
    console.log("  Round created:", {
      roundId: roundId.toString(),
      ticketPrice: ticketPrice.toString(),
      prizes: prizes.map((p) => p.toString()),
      endBlock: endBlock.toString(),
    });

    // Save round to database using transaction
    await tx.insert(rounds).values({
      roundId: Number(roundId),
      ticketPrice: Number(ticketPrice),
      prizes: prizes.map((p) => Number(p)),
      endBlock: Number(endBlock),
    });
    console.log(`  Round ${roundId} saved to database`);

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

  private static async handleTicketPurchased(
    parsed: TypedEventLog<TicketPurchasedEvent.Event>,
    tx: TransactionClient,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { ticketId, buyer, roundId, price } = parsed.args;
    console.log("  Ticket purchased:", {
      ticketId: ticketId.toString(),
      buyer,
      roundId: roundId.toString(),
      price: price.toString(),
    });

    // Ensure user exists (insert if not exists)
    await tx.insert(users).values({ address: buyer }).onConflictDoNothing();

    // Save ticket to database
    await tx.insert(tickets).values({
      ticketId: Number(ticketId),
      roundId: Number(roundId),
      buyer: buyer,
      eventTxId: payload.txId,
      eventLogIndex: payload.logIndex,
    });

    // Update the prize pool for the round (increment by ticket price)
    await tx
      .update(rounds)
      .set({
        prizePool: sql`${rounds.prizePool} + ${Number(price)}`,
      })
      .where(eq(rounds.roundId, Number(roundId)));

    console.log(
      `  Ticket ${ticketId} saved to database and prize pool updated`
    );

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

  private static async handleAmountIncreased(
    parsed: TypedEventLog<AmountIncreasedEvent.Event>,
    tx: TransactionClient,
    _payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { roundId, amount } = parsed.args;
    console.log("  Amount increased:", {
      roundId: roundId.toString(),
      amount: amount.toString(),
    });

    // Update the prize pool for the round (increment by amount)
    await tx
      .update(rounds)
      .set({
        prizePool: sql`${rounds.prizePool} + ${Number(amount)}`,
      })
      .where(eq(rounds.roundId, Number(roundId)));

    console.log(`  Round ${roundId} prize pool increased by ${amount}`);

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
    _tx: TransactionClient,
    _payload: EventPayload
  ): ProcessedEvent {
    const { oldPrice, newPrice, newPrizes } = parsed.args;
    console.log("  Next round details updated:", {
      oldPrice: oldPrice.toString(),
      newPrice: newPrice.toString(),
      newPrizes: newPrizes.map((p) => p.toString()),
    });

    // Note: These configuration changes are only logged, not stored in DB
    // The new values will be used when the next RoundCreated event is emitted

    return {
      eventName: "NextRoundDetailsUpdated",
      decoded: {
        oldPrice: oldPrice.toString(),
        newPrice: newPrice.toString(),
        newPrizes: newPrizes.map((p) => p.toString()),
      },
    };
  }

  private static async handleRoundRevealed(
    parsed: TypedEventLog<RoundRevealedEvent.Event>,
    tx: TransactionClient,
    _payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { roundId, winners, prizes, totalPrize } = parsed.args;
    console.log("  Round revealed:", {
      roundId: roundId.toString(),
      winners,
      prizes: prizes.map((p) => p.toString()),
      totalPrize: totalPrize.toString(),
    });

    // Update round to mark as revealed
    await tx
      .update(rounds)
      .set({ revealed: true })
      .where(eq(rounds.roundId, Number(roundId)));

    // Ensure all winner users exist (batch insert)
    if (winners.length > 0) {
      await tx
        .insert(users)
        .values(winners.map((winner) => ({ address: winner.toLowerCase() })))
        .onConflictDoNothing();

      // Batch insert all winners
      await tx.insert(winnersTable).values(
        winners.map((winner, index) => ({
          roundId: Number(roundId),
          position: index + 1, // Position starts from 1
          winner: winner.toLowerCase(),
          prizeWon: Number(prizes[index]),
        }))
      );
    }

    console.log(
      `  Round ${roundId} marked as revealed with ${winners.length} winners saved`
    );

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

  private static async handleRoleGranted(
    parsed: TypedEventLog<RoleGrantedEvent.Event>,
    tx: TransactionClient,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { role, account, sender } = parsed.args;
    console.log("  Role granted:", {
      role,
      account,
      sender,
    });

    // Ensure user exists (insert if not exists)
    await tx.insert(users).values({ address: account }).onConflictDoNothing();

    const roleName = ROLE_MAPPING[role] || "UNKNOWN";

    // Save role assignment to database
    await tx
      .insert(userRoles)
      .values({
        userAddress: account,
        role: roleName,
        eventTxId: payload.txId,
        eventLogIndex: payload.logIndex,
      })
      .onConflictDoNothing(); // Ignore if role already exists for this user

    console.log(`  Role ${roleName} granted to ${account}`);

    return {
      eventName: "RoleGranted",
      decoded: {
        role,
        account,
        sender,
      },
    };
  }

  private static async handleRoleRevoked(
    parsed: TypedEventLog<RoleRevokedEvent.Event>,
    tx: TransactionClient,
    _payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { role, account, sender } = parsed.args;
    console.log("  Role revoked:", {
      role,
      account,
      sender,
    });

    const roleName = ROLE_MAPPING[role] || "UNKNOWN";

    // Remove role assignment from database
    await tx
      .delete(userRoles)
      .where(
        and(eq(userRoles.userAddress, account), eq(userRoles.role, roleName))
      );

    console.log(`  Role ${roleName} revoked from ${account}`);

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
