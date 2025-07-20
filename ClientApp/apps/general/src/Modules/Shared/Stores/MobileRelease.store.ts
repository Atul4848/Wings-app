import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { IAPIMobileReleaseResponse, IAPIUpsertMobileReleaseRequest } from '../Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { MobileReleaseModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class MobileReleaseStore extends BaseStore {
  /* istanbul ignore next */
  public getMobileRelease(): Observable<MobileReleaseModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIMobileReleaseResponse[]>>(apiUrls.mobileReleases).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIMobileReleaseResponse[]>) =>
        Utilities.customArraySort<MobileReleaseModel>
        (MobileReleaseModel.deserializeList(response.Data), 'mobileReleaseId'))
    )
  }

  /* istanbul ignore next */
  public upsertRelease(mobileRelease: IAPIUpsertMobileReleaseRequest): Observable<MobileReleaseModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const isNewRequest: boolean = mobileRelease.MobileReleaseId === 0;
    const upsertRequest: Observable<IAPIResponse<IAPIUpsertMobileReleaseRequest>> = isNewRequest
      ? http.post<IAPIResponse<IAPIUpsertMobileReleaseRequest>>(apiUrls.mobileReleases, mobileRelease)
      : http.put<IAPIResponse<IAPIUpsertMobileReleaseRequest>>(apiUrls.mobileReleases, mobileRelease);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUpsertMobileReleaseRequest>) =>
        MobileReleaseModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Mobile release ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteRelease(mobileReleaseId: number): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.mobileReleases}?id=${mobileReleaseId}`)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<boolean>) => response.Data)
      );
  }

}