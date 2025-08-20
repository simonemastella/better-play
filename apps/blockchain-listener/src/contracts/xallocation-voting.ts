import { Interface } from "ethers";
import { EventPayload } from "../types/events.js";

export class XAllocationVoting {
  static processEvent(payload: EventPayload, iface: Interface): void {
    const parsed = iface.parseLog(payload.raw);
    if (!parsed) {
      throw Error(`Failed to parse XAllocationVoting event`);
    }

    console.log(
      `[XAllocationVoting] ${parsed.name} at block ${payload.blockNumber}`
    );

    switch (parsed.name) {
      case "RoundCreated":
        console.log("  Round created:");
        // TODO: Initialize lottery round
        break;

      default:
        console.log(`  Unhandled XAllocationVoting event: ${parsed.name}`);
    }
  }
}
