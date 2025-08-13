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
} from '@better-play/database';

// Import Worker 1 (Event Polling Service)
import { EventPollingService } from './event-polling-service.js';
import { VeChainEventPoller } from './vechain-event-poller.js';

// Import Worker 2 (Event Processor)
import { EventProcessor } from './event-processor.js';

// Import types
import type { EventPollingServiceConfig } from './types/events.js';

console.log('Blockchain Listener initialized with:');
console.log('- Worker 1: EventPollingService (RxJS-based event puller)');
console.log('- Worker 2: EventProcessor (Handler-based event processor)');
console.log('- Database models imported');

// Example usage of Worker 1
async function startEventPolling() {
  const config = {
    contracts: {
      lottery: '0x...', // Your lottery contract address
    },
    network: 'testnet' as const,
    startingBlock: 0,
    pollingInterval: 5000,
    processorOptions: {
      retryCount: 3,
      retryDelay: 1000,
    }
  };

  const pollingService = new EventPollingService(config);
  
  // Register handlers with Worker 2 before starting
  // const processor = pollingService.getProcessor();
  // processor.registerHandler(new LotteryEventHandler());
  
  await pollingService.start();
  console.log('Event polling started!');
  
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