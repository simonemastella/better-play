# @better-play/core Usage Example

## How the Blockchain Listener would use the Core package:

```typescript
// Instead of direct database access in contract handlers:

// OLD WAY (tightly coupled):
import { db, rounds, tickets } from '@better-play/database';

export class Lottery {
  static async handleTicketPurchased(parsed, tx) {
    // ❌ Direct database access
    await tx.insert(users).values({ address: buyer }).onConflictDoNothing();
    await tx.insert(tickets).values({...});
    await tx.update(rounds).set({...});
  }
}

// NEW WAY (using core services):
import { LotteryService, UserService, EventService } from '@better-play/core';

export class Lottery {
  constructor(
    private lotteryService: LotteryService,
    private userService: UserService,
    private eventService: EventService
  ) {}

  async handleTicketPurchased(parsed): Promise<ProcessedEvent> {
    // ✅ Clean business logic
    await this.lotteryService.processTicketPurchase({
      ticketId: Number(parsed.args.ticketId),
      buyer: parsed.args.buyer,
      roundId: Number(parsed.args.roundId),
      price: Number(parsed.args.price),
      txId: payload.txId,
      logIndex: payload.logIndex,
    });

    return {
      eventName: 'TicketPurchased',
      decoded: parsed.args,
    };
  }
}
```

## Benefits:

1. **Reusable Logic**: Same services can be used by backend API
2. **Testable**: Easy to mock services for unit tests
3. **Maintainable**: Database changes only affect repositories
4. **Clean Architecture**: Business logic separated from infrastructure

## For NestJS Integration:

```typescript
@Module({
  providers: [
    LotteryRepository,
    UserRepository,
    EventRepository,
    LotteryService,
    UserService,
    EventService,
  ],
  exports: [LotteryService, UserService, EventService],
})
export class CoreModule {}
```