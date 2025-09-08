import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interface } from 'ethers';
import { Lottery__factory } from '@better-play/contracts';
import { XAllocationVoting as XAllocationVotingABI } from '@vechain/vebetterdao-contracts';
import { EventService } from '@better-play/core';
import type { Database } from '@better-play/database';
import type { Configuration } from '../../config/configuration.js';
import type { EventPayload, ProcessedEvent } from '../types/event.types.js';
import { LotteryHandler } from '../handlers/lottery.handler.js';
import { XAllocationVotingHandler } from '../handlers/xallocation-voting.handler.js';

interface ContractConfig {
  name: string;
  interface: Interface;
  handler: { processEvent(parsedEvent: any, payload: EventPayload): Promise<ProcessedEvent | null> };
  criteria: Array<{
    address: string;
    topic0?: string;
  }>;
}

@Injectable()
export class EventProcessorService {
  private readonly logger = new Logger(EventProcessorService.name);
  private contracts: Record<string, ContractConfig> = {};
  private inFlight: number = 0;

  constructor(
    private configService: ConfigService<Configuration>,
    private eventService: EventService,
    private eventEmitter: EventEmitter2,
    private lotteryHandler: LotteryHandler,
    private xAllocationHandler: XAllocationVotingHandler,
    private readonly database: Database
  ) {
    this.initializeContracts();
  }

  private initializeContracts() {
    const network = this.configService.get('blockchain.network', { infer: true })!;
    const lotteryAddress = this.configService.get('blockchain.lotteryContractAddress', { infer: true })!;
    
    // Pre-compute lowercase addresses
    const lotteryAddressLower = lotteryAddress.toLowerCase();
    const xAllocationAddress = XAllocationVotingABI.address[network as keyof typeof XAllocationVotingABI.address];
    const xAllocationAddressLower = xAllocationAddress.toLowerCase();
    
    // Use static interfaces from factories instead of creating new ones  
    const lotteryInterface = Lottery__factory.createInterface();
    const xAllocationInterface = new Interface(XAllocationVotingABI.abi);
    
    const roundCreatedEvent = xAllocationInterface.getEvent('RoundCreated');
    if (!roundCreatedEvent) {
      throw new Error('RoundCreated event not found in XAllocationVoting ABI');
    }

    this.contracts = {
      [lotteryAddressLower]: {
        name: 'Lottery',
        interface: lotteryInterface,
        handler: this.lotteryHandler,
        criteria: [
          {
            address: lotteryAddressLower,
          },
        ],
      },
      [xAllocationAddressLower]: {
        name: 'XAllocationVoting',
        interface: xAllocationInterface,
        handler: this.xAllocationHandler,
        criteria: [
          {
            address: xAllocationAddressLower,
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
    
    if (this.inFlight > 5) {
      this.logger.warn(`⚠️ High processing queue: ${this.inFlight} events in-flight`);
    }
    
    try {
      const address = payload.contractAddress.toLowerCase();
      const contract = this.contracts[address];
      
      if (!contract) {
        this.logger.warn(`❓ Unknown contract: ${address}`);
        return;
      }

      this.logger.debug(`🔄 Processing ${contract.name} event at block ${payload.blockNumber}`);

      // Parse the event once
      const parsed = contract.interface.parseLog(payload.raw as { topics: readonly string[]; data: string; });
      if (!parsed) {
        this.logger.error(`❌ Failed to parse ${contract.name} event: ${payload.txId} index: ${payload.logIndex}`);
        return;
      }

      // Wrap entire event processing in transaction
      await this.database.transaction(async (_tx) => {
        try {
          const processedEvent = await contract.handler.processEvent(parsed, payload);

          if (processedEvent) {
            // Save the event to database within transaction  
            await this.eventService.saveProcessedEvent(processedEvent, {
              txId: payload.txId,
              logIndex: payload.logIndex,
              blockNumber: payload.blockNumber,
            });

            this.logger.log(`✅ ${processedEvent.eventName} event processed (${this.inFlight - 1} remaining in-flight)`);

            // Emit event for other services (future backend API) - only after successful commit
            this.eventEmitter.emit(`blockchain.${contract.name.toLowerCase()}.${processedEvent.eventName.toLowerCase()}`, {
              ...processedEvent,
              payload,
            });
          }
        } catch (error: any) {
          // Check if it's a duplicate constraint violation
          if (error?.code === '23505' || error?.message?.includes('duplicate key') || error?.message?.includes('UNIQUE constraint')) {
            this.logger.debug(`🔄 Skipping duplicate event: ${payload.txId}:${payload.logIndex}`);
            return;
          }
          // Re-throw other errors to trigger rollback
          throw error;
        }
      });
    } finally {
      this.inFlight--;
    }
  }

  getInFlightCount(): number {
    return this.inFlight;
  }

  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        inFlight: this.inFlight,
        processing: this.inFlight > 0,
      },
    };
  }
}