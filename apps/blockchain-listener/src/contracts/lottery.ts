import { Interface } from "ethers";
import { EventPayload } from "../types/events.js";

export class Lottery {
  static processEvent(payload: EventPayload, iface: Interface): void {
    console.log(`[Lottery] received at block ${payload.blockNumber}`);
    const parsed = iface.parseLog(payload.raw);
    if (!parsed) {
      console.error(`Failed to parse Lottery event`);
      return;
    }

    console.log(`[Lottery] ${parsed.name} at block ${payload.blockNumber}`);

    switch (parsed.name) {
      case "TicketPurchased":
        console.log("  Ticket purchased:", parsed.args);
        // TODO: Save to database
        break;

      case "RoundRevealed":
        console.log("  Round revealed:", parsed.args);
        // TODO: Process round reveal
        break;

      case "PrizeClaimed":
        console.log("  Prize claimed:", parsed.args);
        break;
      case "RoleGranted":
        console.log("  RoleGranted:");
        break;

      default:
        console.error(`  Unhandled Lottery event: ${parsed.name}`);
    }
  }
}
