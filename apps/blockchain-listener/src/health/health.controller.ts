import { Controller, Get } from '@nestjs/common';
import { EventProcessorService } from '../blockchain/services/event-processor.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly eventProcessor: EventProcessorService) {}

  @Get()
  getHealth() {
    return this.eventProcessor.getHealthStatus();
  }

  @Get('inflight')
  getInFlight() {
    return {
      inFlight: this.eventProcessor.getInFlightCount(),
      timestamp: new Date().toISOString(),
    };
  }
}