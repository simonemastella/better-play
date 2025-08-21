import { Interface, LogDescription } from "ethers";
import { EventPayload } from "../types/events.js";
import { XAllocationVoting as XAllocationVotingABI } from "@vechain/vebetterdao-contracts/";
import { db } from "@better-play/database";

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

export interface ProcessedEvent {
  eventName: string;
  decoded: Record<string, any>;
}

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class XAllocationVoting {
  static processEvent(
    payload: EventPayload,
    iface: Interface,
    _tx: TransactionClient
  ): ProcessedEvent | null {
    const parsed = iface.parseLog(payload.raw);
    if (!parsed) {
      throw Error(`Failed to parse XAllocationVoting event`);
    }

    switch (parsed.name as XAllocationVotingEventName) {
      case "RoundCreated": {
        const args = parsed.args as unknown as RoundCreatedArgs;
        console.log(`  Round created:`, {
          roundId: args.roundId.toString(),
          startTime: args.voteStart.toString(),
          endTime: args.voteEnd.toString(),
        });

        return {
          eventName: "RoundCreated",
          decoded: {
            roundId: args.roundId.toString(),
            voteStart: args.voteStart.toString(),
            voteEnd: args.voteEnd.toString(),
          },
        };
      }

      default:
        console.log(`Unhandled XAllocationVoting event: ${parsed.name}`);
        return null;
    }
  }
}
