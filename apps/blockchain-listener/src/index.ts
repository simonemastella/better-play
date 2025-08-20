// Import database models
import {
  db,
  events,
  tickets,
  rounds,
  users,
  winners,
  type Event,
  type NewEvent,
  type Ticket,
  type NewTicket,
  type Round,
  type NewRound,
  type Winner,
  type NewWinner,
} from "@better-play/database";
// Import Worker 1 (Event Polling Service)
import { EventPollingService } from "./event-polling-service.js";
import { VeChainEventPoller } from "./vechain-event-poller.js";

// Import Worker 2 (Event Processor) - now created automatically from contractConfigs
import { EventProcessor } from "./event-processor.js";

// Import types
import type { EventPollingServiceConfig } from "./types/events.js";
import { env } from "./env.js";


console.log("Blockchain Listener starting...");

// Start the main service
main().catch((error) => {
  console.error("❌ Failed to start:", error);
  process.exit(1);
});

async function main() {
  console.log("Blockchain Listener initialized with:");
  console.log("- Worker 1: EventPollingService (RxJS-based event puller)");
  console.log("- Worker 2: EventProcessor (Handler-based event processor)");
  console.log("- Database models imported");

  // Start the event polling service
  const service = await startEventPolling();

  // Keep the process running
  process.on("SIGINT", async () => {
    console.log("\n⏹️  Shutting down...");
    await service.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n⏹️  Shutting down...");
    await service.stop();
    process.exit(0);
  });
}

// Example usage of Worker 1
async function startEventPolling() {
  const config: EventPollingServiceConfig = {
    network: env.NETWORK,
    startingBlock: env.STARTING_BLOCK,
    pollingInterval: env.POLLING_INTERVAL,
  };
  console.log("Starting event polling...");
  const pollingService = new EventPollingService(config);

  // Register handlers with Worker 2 before starting
  // const processor = pollingService.getProcessor();
  // processor.registerHandler(new LotteryEventHandler());

  await pollingService.start();
  console.log("Event polling started!");

  return pollingService;
}

// Export everything for external use
export {
  // Database models
  db,
  events,
  tickets,
  rounds,
  users,
  winners,
  type Event,
  type NewEvent,
  type Ticket,
  type NewTicket,
  type Round,
  type NewRound,
  type Winner,
  type NewWinner,
  // Workers
  EventPollingService,
  VeChainEventPoller,
  EventProcessor,
  // Types
  type EventPollingServiceConfig,
  // Functions
  startEventPolling,
};
