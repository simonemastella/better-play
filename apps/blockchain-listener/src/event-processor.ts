import { Interface, keccak256, toUtf8Bytes } from "ethers";
import { Lottery__factory } from "@better-play/contracts";
import { XAllocationVoting as XAllocationVotingABI } from "@vechain/vebetterdao-contracts";
import { EventPayload } from "./types/events.js";
import { env } from "./env.js";
import { Lottery } from "./contracts/lottery.js";
import { XAllocationVoting } from "./contracts/xallocation-voting.js";
import { db, events, transactionWithRetry } from "@better-play/database";

export class EventProcessor {
  private contracts: Record<string, any>;
  private inFlight: number = 0;

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
    this.inFlight++;
    try {
      const address = payload.contractAddress.toLowerCase();
      const contract = this.contracts[address];
      if (!contract) {
        console.warn(`Unknown contract: ${address}`);
        return;
      }

      // Process event within a transaction - let database constraints handle duplicates
      try {
        await transactionWithRetry(db, async (tx) => {
          const processedEvent = await contract.handler.processEvent(
            payload,
            contract.interface,
            tx
          );

          if (processedEvent) {
            // Insert the event into the database - unique constraint will prevent duplicates
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
      } catch (error: any) {
        // Check if it's a duplicate constraint violation
        if (error?.code === '23505' || error?.message?.includes('duplicate key') || error?.message?.includes('UNIQUE constraint')) {
          console.log(`Skipping duplicate event: ${payload.txId}:${payload.logIndex}`);
          return;
        }
        // Re-throw other errors
        throw error;
      }
    } finally {
      this.inFlight--;
    }
  }
}
