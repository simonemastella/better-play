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
      useFactory: (database: Database, eventRepository: EventRepository) => 
        new LotteryRepository(database, eventRepository),
      inject: ['DATABASE', EventRepository],
    },
    {
      provide: UserRepository,
      useFactory: (database: Database, eventRepository: EventRepository) => 
        new UserRepository(database, eventRepository),
      inject: ['DATABASE', EventRepository],
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
    {
      provide: EventService,
      useFactory: (eventRepo: EventRepository) => new EventService(eventRepo),
      inject: [EventRepository],
    },
    {
      provide: UserService,
      useFactory: (userRepo: UserRepository) => new UserService(userRepo),
      inject: [UserRepository],
    },
  ],
  exports: [
    'DATABASE',
    LotteryService,
    UserService, 
    EventService,
  ],
})
export class CoreModule {}