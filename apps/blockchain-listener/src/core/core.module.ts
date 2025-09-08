import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  LotteryService, 
  UserService, 
  EventService,
  LotteryRepository,
  UserRepository,
  EventRepository
} from '@better-play/core';
import { createDatabase, type Database } from '@better-play/database';
import type { Configuration } from '../config/configuration.js';

@Module({
  providers: [
    // Database connection
    {
      provide: 'DATABASE',
      useFactory: (configService: ConfigService<Configuration>): Database => {
        const databaseUrl = configService.get('database.url', { infer: true })!;
        return createDatabase(databaseUrl);
      },
      inject: [ConfigService],
    },
    
    // Repositories
    {
      provide: LotteryRepository,
      useFactory: (database: Database) => new LotteryRepository(database),
      inject: ['DATABASE'],
    },
    {
      provide: UserRepository,
      useFactory: (database: Database) => new UserRepository(database),
      inject: ['DATABASE'],
    },
    {
      provide: EventRepository,
      useFactory: (database: Database) => new EventRepository(database),
      inject: ['DATABASE'],
    },
    
    // Services  
    {
      provide: LotteryService,
      useFactory: (lotteryRepo: LotteryRepository, userRepo: UserRepository, database: Database) => 
        new LotteryService(lotteryRepo, userRepo, database),
      inject: [LotteryRepository, UserRepository, 'DATABASE'],
    },
    UserService,
    EventService,
  ],
  exports: [
    LotteryService,
    UserService, 
    EventService,
  ],
})
export class CoreModule {}