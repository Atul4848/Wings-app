import { Observable, of } from 'rxjs';
import { EntityOptionsStore } from '../Stores';
import { IAPIGridRequest, SEARCH_ENTITY_TYPE, tapWithAction, EntityMapModel } from '@wings-shared/core';

export class EntityOptionsStoreMock extends EntityOptionsStore {
  private testData = [ new EntityMapModel({ entityId: 0, name: 'test', code: 'TEST123' }) ];

  // Search Entity based on field value
  public searchEntity(searchEntityType: SEARCH_ENTITY_TYPE, request: IAPIGridRequest): Observable<EntityMapModel[]> {
    switch (searchEntityType) {
      case SEARCH_ENTITY_TYPE.COUNTRY:
        return of(this.testData).pipe(tapWithAction(response => (this.countries = response)));
      case SEARCH_ENTITY_TYPE.STATE:
        return of(this.testData).pipe(tapWithAction(response => (this.states = response)));
      case SEARCH_ENTITY_TYPE.FIR:
        return of(this.testData).pipe(tapWithAction(response => (this.states = response)));
      case SEARCH_ENTITY_TYPE.AIRPORT:
        return of(this.testData).pipe(tapWithAction(response => (this.wingsAirports = response)));
      default:
        return of([]);
    }
  }
}
