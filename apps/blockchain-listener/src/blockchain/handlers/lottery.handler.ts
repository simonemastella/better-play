import { Injectable, Logger } from '@nestjs/common';
import { 
  LotteryService, 
  UserService,
  type TicketPurchaseData,
  type CreateRoundData,
  type RoundRevealData,
  type AmountIncreasedData,
  type RoleGrantedData,
  type RoleRevokedData
} from '@better-play/core';
import type {
  RoundCreatedEvent,
  TicketPurchasedEvent, 
  AmountIncreasedEvent,
  NextRoundDetailsUpdatedEvent,
  RoundRevealedEvent,
  RoleGrantedEvent,
  RoleRevokedEvent
} from '@better-play/contracts';
import type { EventPayload, ProcessedEvent } from '../types/event.types.js';

type LotteryEventName = 
  | 'RoundCreated' 
  | 'TicketPurchased' 
  | 'AmountIncreased' 
  | 'NextRoundDetailsUpdated' 
  | 'RoundRevealed' 
  | 'RoleGranted' 
  | 'RoleRevoked';

@Injectable()
export class LotteryHandler {
  private readonly logger = new Logger(LotteryHandler.name);

  constructor(
    private lotteryService: LotteryService,
    private userService: UserService
  ) {}

  async processEvent(
    parsed: any,
    payload: EventPayload
  ): Promise<ProcessedEvent | null> {
    this.logger.debug(`🎰 [Lottery] received at block ${payload.blockNumber}`);
    this.logger.log(`🎰 [Lottery] ${parsed.name} at block ${payload.blockNumber}`);

    switch (parsed.name as LotteryEventName) {
      case 'RoundCreated':
        return this.handleRoundCreated(parsed as any, payload);
      case 'TicketPurchased':
        return this.handleTicketPurchased(parsed as any, payload);
      case 'AmountIncreased':
        return this.handleAmountIncreased(parsed as any, payload);
      case 'NextRoundDetailsUpdated':
        return this.handleNextRoundDetailsUpdated(parsed as any);
      case 'RoundRevealed':
        return this.handleRoundRevealed(parsed as any, payload);
      case 'RoleGranted':
        return this.handleRoleGranted(parsed as any, payload);
      case 'RoleRevoked':
        return this.handleRoleRevoked(parsed as any, payload);
      default:
        this.logger.log(`❓ Unhandled Lottery event: ${parsed.name}`);
        return null;
    }
  }

  private async handleRoundCreated(
    parsed: RoundCreatedEvent.Log,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { roundId, ticketPrice, prizes, endBlock } = parsed.args;
    
    this.logger.log('🎰 Round created:', {
      roundId: roundId.toString(),
      ticketPrice: ticketPrice.toString(),
      prizes: prizes.map((p) => p.toString()),
      endBlock: endBlock.toString(),
    });

    const roundData: CreateRoundData = {
      roundId: Number(roundId),
      ticketPrice: Number(ticketPrice),
      prizes: prizes.map((p) => Number(p)),
      endBlock: Number(endBlock),
    };

    const eventData = {
      roundId: roundId.toString(),
      ticketPrice: ticketPrice.toString(),
      prizes: prizes.map((p) => p.toString()),
      endBlock: endBlock.toString(),
    };

    await this.lotteryService.createRound(roundData, {
      txId: payload.txId,
      logIndex: payload.logIndex,
      blockNumber: payload.blockNumber,
      decoded: eventData,
    });
    this.logger.log(`✅ Round ${roundId} saved to database`);

    return {
      eventName: 'RoundCreated',
      decoded: eventData,
    };
  }

  private async handleTicketPurchased(
    parsed: TicketPurchasedEvent.Log,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { ticketId, buyer, roundId, price } = parsed.args;
    
    this.logger.log('🎫 Ticket purchased:', {
      ticketId: ticketId.toString(),
      buyer,
      roundId: roundId.toString(),
      price: price.toString(),
    });

    const ticketData: TicketPurchaseData = {
      ticketId: Number(ticketId),
      buyer: buyer,
      roundId: Number(roundId),
      price: Number(price),
      txId: payload.txId,
      logIndex: payload.logIndex,
    };

    const eventData = {
      ticketId: ticketId.toString(),
      buyer,
      roundId: roundId.toString(),
      price: price.toString(),
    };

    await this.lotteryService.processTicketPurchase(ticketData, {
      txId: payload.txId,
      logIndex: payload.logIndex,
      blockNumber: payload.blockNumber,
      decoded: eventData,
    });
    this.logger.log(`✅ Ticket ${ticketId} saved and prize pool updated`);

    return {
      eventName: 'TicketPurchased',
      decoded: eventData,
    };
  }

  private async handleAmountIncreased(
    parsed: AmountIncreasedEvent.Log,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { roundId, amount } = parsed.args;
    
    this.logger.log('💰 Amount increased:', {
      roundId: roundId.toString(),
      amount: amount.toString(),
    });

    const amountData: AmountIncreasedData = {
      roundId: Number(roundId),
      amount: Number(amount),
    };

    const eventData = {
      roundId: roundId.toString(),
      amount: amount.toString(),
    };

    await this.lotteryService.processAmountIncrease(amountData, {
      txId: payload.txId,
      logIndex: payload.logIndex,
      blockNumber: payload.blockNumber,
      decoded: eventData,
    });
    this.logger.log(`✅ Round ${roundId} prize pool increased by ${amount}`);

    return {
      eventName: 'AmountIncreased',
      decoded: eventData,
    };
  }

  private handleNextRoundDetailsUpdated(
    parsed: NextRoundDetailsUpdatedEvent.Log
  ): ProcessedEvent {
    const { oldPrice, newPrice, newPrizes } = parsed.args;
    
    this.logger.log('⚙️ Next round details updated:', {
      oldPrice: oldPrice.toString(),
      newPrice: newPrice.toString(),
      newPrizes: newPrizes.map((p) => p.toString()),
    });

    // Configuration changes are only logged, not stored in DB
    return {
      eventName: 'NextRoundDetailsUpdated',
      decoded: {
        oldPrice: oldPrice.toString(),
        newPrice: newPrice.toString(),
        newPrizes: newPrizes.map((p) => p.toString()),
      },
    };
  }

  private async handleRoundRevealed(
    parsed: RoundRevealedEvent.Log,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { roundId, winners, prizes, totalPrize } = parsed.args;
    
    this.logger.log('🏆 Round revealed:', {
      roundId: roundId.toString(),
      winners,
      prizes: prizes.map((p) => p.toString()),
      totalPrize: totalPrize.toString(),
    });

    const revealData: RoundRevealData = {
      roundId: Number(roundId),
      winners: [...winners],
      prizes: prizes.map((p) => Number(p)),
      totalPrize: Number(totalPrize),
    };

    const eventData = {
      roundId: roundId.toString(),
      winners,
      prizes: prizes.map((p) => p.toString()),
      totalPrize: totalPrize.toString(),
    };

    await this.lotteryService.processRoundReveal(revealData, {
      txId: payload.txId,
      logIndex: payload.logIndex,
      blockNumber: payload.blockNumber,
      decoded: eventData,
    });
    this.logger.log(`✅ Round ${roundId} marked as revealed with ${winners.length} winners`);

    return {
      eventName: 'RoundRevealed',
      decoded: eventData,
    };
  }

  private async handleRoleGranted(
    parsed: RoleGrantedEvent.Log,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { role, account, sender } = parsed.args;
    
    this.logger.log('👤 Role granted:', { role, account, sender });

    const roleData: RoleGrantedData = {
      role,
      account,
      sender,
      txId: payload.txId,
      logIndex: payload.logIndex,
    };

    const eventData = { role, account, sender };

    await this.userService.grantRole(roleData, {
      txId: payload.txId,
      logIndex: payload.logIndex,
      blockNumber: payload.blockNumber,
      decoded: eventData,
    });
    this.logger.log(`✅ Role granted to ${account}`);

    return {
      eventName: 'RoleGranted',
      decoded: eventData,
    };
  }

  private async handleRoleRevoked(
    parsed: RoleRevokedEvent.Log,
    payload: EventPayload
  ): Promise<ProcessedEvent> {
    const { role, account, sender } = parsed.args;
    
    this.logger.log('👤 Role revoked:', { role, account, sender });

    const roleData: RoleRevokedData = {
      role,
      account,
      sender,
    };

    const eventData = { role, account, sender };

    await this.userService.revokeRole(roleData, {
      txId: payload.txId,
      logIndex: payload.logIndex,
      blockNumber: payload.blockNumber,
      decoded: eventData,
    });
    this.logger.log(`✅ Role revoked from ${account}`);

    return {
      eventName: 'RoleRevoked',
      decoded: eventData,
    };
  }
}