import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { observable } from 'mobx';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IAPISyncHistoryResponse } from '../Interfaces';
import { SyncHistoryModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class SyncHistoryStore extends BaseStore {
  @observable public syncHistory: SyncHistoryModel[] = [];

  /* istanbul ignore next */
  public getSyncHistory(size: number): Observable<SyncHistoryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPISyncHistoryResponse[]>(`${apiUrls.syncHistory}?size=${size}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISyncHistoryResponse[]>) =>
        Utilities.customArraySort<SyncHistoryModel>(SyncHistoryModel.deserializeList(response?.Data), 'tripNumber')
      )
    );
  }
}
