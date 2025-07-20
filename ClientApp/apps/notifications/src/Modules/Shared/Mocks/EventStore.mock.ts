import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FIELD_TYPE } from '../index';
import { EventModel, EventTypeModel, FieldDefinitionModel, FieldTypeModel } from '../Models';
import { EventStore } from '../Stores';

export class EventStoreMock extends EventStore {
  public getEvents(): Observable<EventModel[]> {
    return of([ new EventModel(), new EventModel() ]).pipe(tap(events => (this.events = events)));
  }

  public removeEvent({ id }: EventModel): Observable<boolean> {
    return of(true);
  }

  public upsertEvent(event: EventModel): Observable<EventModel> {
    return of(new EventModel());
  }

  public loadEventById(id: number): Observable<EventModel> {
    return of(
      new EventModel({
        eventType: new EventTypeModel({ id: 1 }),
        attributeDefinition: [
          new FieldDefinitionModel({ fieldType: FieldTypeModel.deserialize(FIELD_TYPE.BOOL), variableName: 'test' }),
          new FieldDefinitionModel({ fieldType: FieldTypeModel.deserialize(FIELD_TYPE.DATE) }),
          new FieldDefinitionModel({ fieldType: FieldTypeModel.deserialize(FIELD_TYPE.STRING) }),
        ],
      })
    );
  }
}
