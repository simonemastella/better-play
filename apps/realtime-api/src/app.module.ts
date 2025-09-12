import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Redis } from 'ioredis';
import { EventsController } from './events.controller.js';
import { RedisSubscriberService } from './redis-subscriber.service.js';
import { env } from './config/env.js';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),
  ],
  controllers: [EventsController],
  providers: [
    EventsController, 
    RedisSubscriberService,
    {
      provide: 'REDIS',
      useFactory: (): Redis => {
        return new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          password: env.REDIS_PASSWORD,
          maxRetriesPerRequest: 3,
        });
      },
    },
  ],
})
export class AppModule {}