import { Interface, keccak256, toUtf8Bytes } from "ethers";
import { Lottery__factory } from "@better-play/contracts";
import { XAllocationVoting as XAllocationVotingABI } from "@vechain/vebetterdao-contracts";
import { EventPayload } from "./types/events.js";
import { env } from "./env.js";
import { Lottery } from "./contracts/lottery.js";
import { XAllocationVoting } from "./contracts/xallocation-voting.js";

export class EventProcessor {
  private contracts: Record<string, any>;

  constructor() {
    const roundCreatedEvent = XAllocationVotingABI.abi.find(
      (e) => e.type == "event" && e.name == "RoundCreated"
    )!;
    const eventSignature = `${roundCreatedEvent.name}(${roundCreatedEvent.inputs
      .map((input) => input.type)
      .join(",")})`;

    this.contracts = {
      [env.LOTTERY_CONTRACT_ADDRESS.toLowerCase()]: {
        name: "Lottery",
        interface: new Interface(Lottery__factory.abi),
        handler: Lottery,
        criteria: [
          {
            address: env.LOTTERY_CONTRACT_ADDRESS.toLowerCase(),
          },
        ],
      },
      [XAllocationVotingABI.address[env.NETWORK].toLowerCase()]: {
        name: "XAllocationVoting",
        interface: new Interface(XAllocationVotingABI.abi),
        handler: XAllocationVoting,
        criteria: [
          {
            address: XAllocationVotingABI.address[env.NETWORK].toLowerCase(),
            topic0: keccak256(toUtf8Bytes(eventSignature)),
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
    console.warn(`contract: ${address}`);

    if (!contract) {
      console.warn(`Unknown contract: ${address}`);
      return;
    }

    contract.handler.processEvent(payload, contract.interface);
  }
}
