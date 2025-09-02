import { Interface, keccak256, toUtf8Bytes } from "ethers";
import { Lottery__factory } from "@better-play/contracts";
import { XAllocationVoting as XAllocationVotingABI } from "@vechain/vebetterdao-contracts";
import { EventPayload } from "./types/events.js";
import { env } from "./env.js";
import { Lottery } from "./contracts/lottery.js";
import { XAllocationVoting } from "./contracts/xallocation-voting.js";
import { db, events, transactionWithRetry } from "@better-play/database";
import { eq, and } from "drizzle-orm";

export class EventProcessor {
  private contracts: Record<string, any>;

  constructor() {
    const roundCreatedEvent =
      XAllocationVotingABI.interface.getEvent("RoundCreated");

    this.contracts = {
      [env.LOTTERY_CONTRACT_ADDRESS.toLowerCase()]: {
        name: "Lottery",
        interface: new Interface(Lottery__factory.abi),
        handler: Lottery,
        criteria: [
          {
            address: env.LOTTERY_CONTRACT_ADDRESS.toLowerCase(),
          },
          // You can have multiple contract that can be handled by the same class handler
          // { address: env.LOTTERY_CONTRACT_ADDRESS_BIS.toLowerCase() },
        ],
      },
      [XAllocationVotingABI.address[env.NETWORK].toLowerCase()]: {
        name: "XAllocationVoting",
        interface: new Interface(XAllocationVotingABI.abi),
        handler: XAllocationVoting,
        criteria: [
          {
            address: XAllocationVotingABI.address[env.NETWORK].toLowerCase(),
            topic0: roundCreatedEvent.topicHash,
          },
        ],
      },
    };
  }

  getCriteria() {
    return Object.values(this.contracts).flatMap(
      (contract) => contract.criteria
    );
  }

  async processEvent(payload: EventPayload): Promise<void> {
    const address = payload.contractAddress.toLowerCase();
    const contract = this.contracts[address];
    if (!contract) {
      console.warn(`Unknown contract: ${address}`);
      return;
    }

    // Check if event already exists in database
    const eventExists = await this.eventExists(payload);
    if (eventExists) {
      console.log(
        `Skipping event already processed: ${payload.txId}:${payload.logIndex}`
      );
      return;
    }

    // Process event within a transaction with automatic retry for transient errors
    await transactionWithRetry(db, async (tx) => {
      const processedEvent = await contract.handler.processEvent(
        payload,
        contract.interface,
        tx
      );

      if (processedEvent) {
        // Insert the event into the database
        await tx.insert(events).values({
          txId: payload.txId,
          logIndex: payload.logIndex,
          eventName: processedEvent.eventName,
          blockNumber: payload.blockNumber,
          decoded: processedEvent.decoded,
        });

        console.log(`  ${processedEvent.eventName} event saved to database`);
      }
    });
  }

  private async eventExists(payload: EventPayload): Promise<boolean> {
    try {
      const existingEvent = await db
        .select({ txId: events.txId })
        .from(events)
        .where(
          and(
            eq(events.txId, payload.txId),
            eq(events.logIndex, payload.logIndex)
          )
        )
        .limit(1);

      return existingEvent.length > 0;
    } catch (error) {
      console.error(
        `Failed to check event existence for ${payload.txId}:${payload.logIndex}:`,
        error
      );
      // On error, assume event doesn't exist to avoid skipping events
      return false;
    }
  }
}
