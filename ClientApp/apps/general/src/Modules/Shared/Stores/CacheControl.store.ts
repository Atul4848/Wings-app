import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPICacheSettingResponse, IAPIUpdateSettingResponse } from '../Interfaces';
import { SettingsModel } from '../Models';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class CacheControlStore extends BaseStore {
  /* istanbul ignore next */
  public invalidateCacheData(customerNumber: string): Observable<IAPIResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<IAPIResponse>(`${apiUrls.invalidateCacheData}?customerNumber=${customerNumber}`).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse) => AlertStore.info(
        `${response?.Data} cache entrie(s) for customer number: ${customerNumber} invalidated successfully`
      ))
    );
  }

  /* istanbul ignore next */
  public getCacheSettings(): Observable<SettingsModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPICacheSettingResponse[]>(apiUrls.cacheSettings).pipe(
      Logger.observableCatchError,
      map((response: IAPICacheSettingResponse[]) => {
        return Utilities.customArraySort<SettingsModel>(SettingsModel.deserializeList(response), 'name')
      })
    )
  }

  /* istanbul ignore next */
  public resetCacheSetting(key: string): Observable<SettingsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPICacheSettingResponse>(`${apiUrls.resetSetting}?key=${key}`).pipe(
      Logger.observableCatchError,
      map((response: IAPICacheSettingResponse) => {
        return SettingsModel.deserialize(response)
      }),
      tap(() => AlertStore.info('Setting updated to default successfully'))
    )
  }

  /* istanbul ignore next */
  public updateCacheSetting(setting: SettingsModel): Observable<IAPIUpdateSettingResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const requestData = SettingsModel.serialize(setting);
    return http.post<IAPIUpdateSettingResponse>(apiUrls.updateSetting, requestData).pipe(
      Logger.observableCatchError,
      tap((response: IAPIUpdateSettingResponse) => {
        if (response?.Success) {
          AlertStore.info(`Updated setting: ${setting.name}, successfully`);
        }
      })
    )
  }
}