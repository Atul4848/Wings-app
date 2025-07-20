import { CacheControlStore, SettingsModel } from '..';
import { Observable, of } from 'rxjs';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';

export class CacheControlStoreMock extends CacheControlStore {
  invalidateCacheData(customerNumber: string): Observable<IAPIResponse> {
    return of({ Data: 0, HttpStatusCode: '200', Errors: {}, Warnings: {}, Meta: {} })
  }

  getCacheSettings(): Observable<IAPIResponse> {
    return of({ Data: [ new SettingsModel() ], HttpStatusCode: '200', Errors: {}, Warnings: {}, Meta: {} })
  }
}
