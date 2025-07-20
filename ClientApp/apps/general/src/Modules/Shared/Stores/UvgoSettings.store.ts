import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable, throwError } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap, catchError } from 'rxjs/operators';
import { IAPIUvgoSettingsResponse } from '../Interfaces';
import { UvgoSettings, OptionKey, SettingOptionsModel } from '../Models';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { action, observable } from 'mobx';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class UvgoSettingsStore extends BaseStore {
  @observable public keyNames: OptionKey[] = [];
  @observable public uvgoSetting: UvgoSettings[] = [];
  @observable public optionsField: SettingOptionsModel[] = [];
  
  @action
  public setOptionsField = (options: SettingOptionsModel[]) =>{
    this.optionsField = options;
  }

  /* istanbul ignore next */
  public getUvgoSetting(id: string): Observable<UvgoSettings> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIUvgoSettingsResponse>>(`${apiUrls.settings}?id=${id}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUvgoSettingsResponse>) => UvgoSettings.deserialize(response.Data))
    )
  }

  /* istanbul ignore next */
  public getUvgoSettings(): Observable<UvgoSettings[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIUvgoSettingsResponse[]>>(apiUrls.settings).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUvgoSettingsResponse[]>) => {
        this.uvgoSetting = Utilities.customArraySort<UvgoSettings>(UvgoSettings.deserializeList(response.Data), 'name');
        return this.uvgoSetting;
      })
    )
  }

  /* istanbul ignore next */
  public deleteUvgoSetting(id: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.settings}?id=${id}`)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<boolean>) => response.Data)
      );
  }

  /* istanbul ignore next */
  public upsertUvgoSettings(
    uvgoSetting: UvgoSettings,
    isNewRequest: boolean): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const upsertRequest: Observable<IAPIResponse<boolean>> = isNewRequest
      ? http.post<IAPIResponse<boolean>>(apiUrls.settings, uvgoSetting.serialize())
      : http.put<IAPIResponse<boolean>>(apiUrls.settings, uvgoSetting.serialize());
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap((response: any) => {
        if (response.Data === true) {
          AlertStore.info(`Setting ${isNewRequest ? 'created' : 'updated'} successfully!`);
        }
      })
    );
  }

  /* istanbul ignore next */
  public getOptionkeys(): Observable<OptionKey[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<string[]>>(apiUrls.optionKey)
      .pipe(
        map(response => OptionKey.deserializeList(response.Data)),
        tap(keyNames => this.keyNames = keyNames),
        Logger.observableCatchError,
      );
  }

  /* istanbul ignore next */
  public exportUserSetting(id: string): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.publicApi,
      responseType: 'blob',
    });
    const params = Utilities.buildParamString({
      id,
    });
    return http.get(`${apiUrls.exportUserSetting}?${params}`).pipe(
      Logger.observableCatchError,
      catchError(err => {
        AlertStore.critical(err.message);
        return throwError(err);
      }));
  }

  /* istanbul ignore next */
  public uploadImportData(file: File): Observable<File> {
    const data: FormData = new FormData();
    data.append('file', file);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.post(apiUrls.importUserSetting, data).pipe(Logger.observableCatchError);
  }
}
