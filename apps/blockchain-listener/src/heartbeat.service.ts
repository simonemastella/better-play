import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HeartbeatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HeartbeatService.name);
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    this.startHeartbeat();
    this.logger.log('Heartbeat service started');
  }

  onModuleDestroy() {
    this.stopHeartbeat();
    this.logger.log('Heartbeat service stopped');
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const heartbeatData = {
        timestamp: new Date().toISOString(),
        status: 'alive',
        service: 'blockchain-listener',
        uptime: process.uptime(),
      };

      // Emit heartbeat event
      this.eventEmitter.emit('system.heartbeat', heartbeatData);
      this.logger.debug('💓 Heartbeat emitted');
    }, 5000); // Every 5 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}