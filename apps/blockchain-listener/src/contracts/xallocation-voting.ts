import { Interface, LogDescription } from "ethers";
import { EventPayload } from "../types/events.js";
import { XAllocationVoting as XAllocationVotingABI } from "@vechain/vebetterdao-contracts/";
import { db, events } from "@better-play/database";

// Extract event names as a type from ABI
type XAllocationVotingEventName = Extract<
  (typeof XAllocationVotingABI.abi)[number],
  { type: "event" }
>["name"];

interface RoundCreatedArgs {
  roundId: bigint;
  voteStart: bigint;
  voteEnd: bigint;
}

export class XAllocationVoting {
  static async processEvent(
    payload: EventPayload,
    iface: Interface
  ): Promise<void> {
    const parsed = iface.parseLog(payload.raw);
    if (!parsed) {
      throw Error(`Failed to parse XAllocationVoting event`);
    }

    console.log(
      `[XAllocationVoting] ${parsed.name} at block ${payload.blockNumber}`
    );

    switch (parsed.name as XAllocationVotingEventName) {
      case "RoundCreated":
        await this.handleRoundCreated(
          parsed.args as unknown as RoundCreatedArgs,
          payload
        );
        break;

      default:
        console.log(`  Unhandled XAllocationVoting event: ${parsed.name}`);
    }
  }

  private static async handleRoundCreated(
    args: RoundCreatedArgs,
    payload: EventPayload
  ): Promise<void> {
    console.log(`  Round created:`, {
      roundId: args.roundId.toString(),
      startTime: args.voteStart.toString(),
      endTime: args.voteEnd.toString(),
    });

    try {
      await db.insert(events).values({
        txId: payload.txId,
        logIndex: payload.logIndex,
        eventName: "RoundCreated",
        blockNumber: payload.blockNumber,
        decoded: {
          roundId: args.roundId.toString(),
          voteStart: args.voteStart.toString(),
          voteEnd: args.voteEnd.toString(),
        },
      });

      console.log(`  RoundCreated event saved to database`);
    } catch (error) {
      console.error(`  Failed to save RoundCreated event:`, error);
    }
  }
}
