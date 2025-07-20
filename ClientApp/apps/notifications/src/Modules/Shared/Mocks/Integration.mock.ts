import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventTypeModel } from '../Models';
import { EventTypeStore } from '../Stores';

export class IntegrationStoreMock extends EventTypeStore {
  public getEventTypes(): Observable<EventTypeModel[]> {
    return of([ new EventTypeModel({ id: 1 }), new EventTypeModel({ id: 2 }) ]).pipe(
      tap(eventTypes => (this.eventTypes = eventTypes))
    );
  }
}
