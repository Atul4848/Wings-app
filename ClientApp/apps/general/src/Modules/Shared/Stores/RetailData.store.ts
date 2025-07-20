import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { IAPIRetailDataOptionsResponse, IAPIRetailDataResponse } from '../Interfaces';
import { RetailDataModel } from '../Models';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class RetailDataStore extends BaseStore {
  /* istanbul ignore next */
  public getRetailData(): Observable<RetailDataModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIRetailDataResponse[]>>(apiUrls.retailData).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIRetailDataResponse[]>) =>
        Utilities.customArraySort<RetailDataModel>
        (RetailDataModel.deserializeList(response.Data), 'StartDate'))
    )
  }

  /* istanbul ignore next */
  public upsertRetailData(retailDataOptions: IAPIRetailDataOptionsResponse): Observable<RetailDataModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const upsertRequest: Observable<IAPIResponse<IAPIRetailDataOptionsResponse>> = 
        http.post<IAPIResponse<IAPIRetailDataOptionsResponse>>(apiUrls.retailData, retailDataOptions)
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIRetailDataResponse>) =>
        RetailDataModel.deserialize(response.Data)),
      tap(() => AlertStore.info('Retail Data Run successfully!'))
    );
  }

}