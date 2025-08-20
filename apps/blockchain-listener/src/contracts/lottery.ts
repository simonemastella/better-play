import { Interface, LogDescription } from "ethers";
import { EventPayload } from "../types/events.js";
import { Lottery__factory } from "packages/contracts/dist/typechain-types/index.js";

// Extract event names as a type from ABI
type LotteryEventName = Extract<
  (typeof Lottery__factory.abi)[number],
  { type: "event" }
>["name"];

export class Lottery {
  static processEvent(payload: EventPayload, iface: Interface): void {
    console.log(`[Lottery] received at block ${payload.blockNumber}`);
    const parsed = iface.parseLog(payload.raw);
    if (!parsed) {
      console.error(`Failed to parse Lottery event`);
      return;
    }

    console.log(`[Lottery] ${parsed.name} at block ${payload.blockNumber}`);

    switch (parsed.name as LotteryEventName) {
      case "RoundCreated":
        console.log("  Round created:", parsed.args);
        // TODO: Save to database
        break;

      case "TicketPurchased":
        console.log("  Ticket purchased:", parsed.args);
        // TODO: Save to database
        break;

      case "AmountIncreased":
        console.log("  Amount increased:", parsed.args);
        break;

      case "NextRoundDetailsUpdated":
        console.log("  Next round details updated:", parsed.args);
        break;

      case "RoundRevealed":
        console.log("  Round revealed:", parsed.args);
        // TODO: Process round reveal
        break;

      case "PrizeClaimed":
        console.log("  Prize claimed:", parsed.args);
        break;
      case "RoleGranted":
        console.log("  Prize claimed:", parsed.args);
        break;
      case "RoleRevoked":
        console.log("  Prize claimed:", parsed.args);
        break;

      default:
        console.log(`  Unhandled Lottery event: ${parsed.name}`);
    }
  }
}
