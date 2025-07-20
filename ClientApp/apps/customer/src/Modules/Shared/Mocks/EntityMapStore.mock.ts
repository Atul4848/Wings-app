import { EntityMapStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { EntityMapModel } from '@wings-shared/core';

export class EntityMapStoreMock extends EntityMapStore {
  public getServiceType(): Observable<EntityMapModel[]> {
    return of([ new EntityMapModel(), new EntityMapModel() ]);
  }
}
