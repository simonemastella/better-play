import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsController } from './events.controller.js';

@Injectable()
export class EventBridgeService implements OnModuleInit {
  constructor(
    @Inject(EventEmitter2) private eventEmitter: EventEmitter2,
    private eventsController: EventsController,
  ) {}

  onModuleInit() {
    // Listen to all events from blockchain-listener
    // this.eventEmitter.onAny((eventName, payload) => {
    //   // Broadcast to SSE clients
    //   this.eventsController.broadcastEvent({
    //     event: eventName,
    //     data: payload,
    //     timestamp: new Date().toISOString(),
    //   });
    // });

    // Example: Listen to specific blockchain events
    this.eventEmitter.on('blockchain.*', (data) => {
      console.log('Broadcasting blockchain event:', data);
    });
  }
}