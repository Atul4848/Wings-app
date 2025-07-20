import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { IAPISyncSettings } from '../Interfaces';
import { SyncSettingsModel } from '../Models';
import { AlertStore } from '@uvgo-shared/alert';
import { SETTING_TYPE } from '../Enums';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class SyncSettingsStore extends BaseStore {
  
  /* istanbul ignore next */
  public getSyncSettings(settingType: SETTING_TYPE): Observable<SyncSettingsModel[]> {
    const type = settingType == SETTING_TYPE.SETTING ? 'Setting' : 'recurring';
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPISyncSettings[]>(`${apiUrls.syncSettings(type)}`).pipe(
      Logger.observableCatchError,
      map((response: IAPISyncSettings[]) => {
        return Utilities.customArraySort<SyncSettingsModel>(SyncSettingsModel.deserializeList(response), 'name');
      })
    );
  }

  /* istanbul ignore next */
  public upsertSyncSettings(request: IAPISyncSettings): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post<boolean>(apiUrls.updateSetting, request).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Success),
      tap(() => AlertStore.info(`${request.Key} updated successfully!`))
    );
  }

  /* istanbul ignore next */
  public resetSyncSettings(key: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<boolean>(`${apiUrls.resetSetting}?key=${key}`).pipe(
      Logger.observableCatchError,
      map((response: any) => response.Success),
      tap(() => AlertStore.info(`${key} reset successfully!`))
    );
  }

}
