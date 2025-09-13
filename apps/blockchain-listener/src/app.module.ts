import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BlockchainModule } from './blockchain/blockchain.module.js';
import { CoreModule } from './core/core.module.js';
import { HealthModule } from './health/health.module.js';
import { RedisPublisherService } from './redis-publisher.service.js';
import { HeartbeatService } from './heartbeat.service.js';
import { configuration } from './config/configuration.js';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // Event system
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),

    // Business logic
    CoreModule,
    
    // Blockchain processing
    BlockchainModule,
    
    // Health monitoring
    HealthModule,
  ],
  providers: [RedisPublisherService, HeartbeatService],
})
export class AppModule {}