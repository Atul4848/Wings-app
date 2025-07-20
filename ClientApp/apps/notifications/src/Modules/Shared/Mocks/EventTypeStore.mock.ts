import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventTypeModel, FieldDefinitionModel } from '../Models';
import { EventTypeStore } from '../Stores';

export class EventTypeStoreMock extends EventTypeStore {
  public getEventTypes(): Observable<EventTypeModel[]> {
    return of([ new EventTypeModel({ id: 1 }), new EventTypeModel({ id: 2 }) ]).pipe(
      tap(eventTypes => (this.eventTypes = eventTypes))
    );
  }

  public removeEventType({ id }: EventTypeModel): Observable<boolean> {
    return of(true);
  }

  public upsertEventType(eventType: EventTypeModel): Observable<EventTypeModel> {
    return of(new EventTypeModel());
  }

  public loadEventTypeById(id: number): Observable<EventTypeModel> {
    return of(new EventTypeModel({ fieldDefinitions: [ new FieldDefinitionModel({ id: 1 }) ] }));
  }
}
