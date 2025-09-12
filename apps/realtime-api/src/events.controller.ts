import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('events')
export class EventsController {
  private eventsSubject = new Subject<any>();

  @Sse()
  sendEvents(): Observable<MessageEvent> {
    return this.eventsSubject.asObservable().pipe(
      map((data) => ({ data }))
    );
  }

  broadcastEvent(eventData: any) {
    this.eventsSubject.next(eventData);
  }
}