import { Controller, Sse, MessageEvent, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller()
export class EventsController {
  private readonly logger = new Logger(`🟦 ${EventsController.name}`);

  constructor(private eventEmitter: EventEmitter2) {}

  @Sse('events')
  sendEvents(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const handler = (eventName: string, data: any) => {
        subscriber.next({
          data: JSON.stringify({
            event: eventName,
            data,
            timestamp: new Date().toISOString()
          })
        });
      };
      
      this.eventEmitter.onAny(handler);
      
      // Send connection message
      subscriber.next({
        data: JSON.stringify({
          event: 'connected',
          data: { message: 'SSE connection established' },
          timestamp: new Date().toISOString()
        })
      });
      
      return () => this.eventEmitter.offAny(handler);
    });
  }

}
