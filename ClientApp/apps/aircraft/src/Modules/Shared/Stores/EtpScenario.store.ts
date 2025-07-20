import { AlertStore } from '@uvgo-shared/alert';
import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { IAPIEtpScenario, IAPIEtpScenarioDetail, IAPIImportEtpScenario } from '../Interfaces';
import { EtpScenarioDetailModel, EtpScenarioModel } from '../Models';
import { action, observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class EtpScenarioStore extends BaseStore {
  @observable public etpScenarios: EtpScenarioModel[] = [];

  /* istanbul ignore next */
  public getEtpScenarios(): Observable<EtpScenarioModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get<IAPIEtpScenario>(`${apiUrls.etpScenario}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => EtpScenarioModel.deserializeList(response.results)),
      tap(etpScenarios => (this.etpScenarios = etpScenarios))
    );
  }

  /* istanbul ignore next */
  @action
  public upsertEtpScenarioDetail(request: EtpScenarioDetailModel): Observable<EtpScenarioDetailModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIEtpScenarioDetail> = isNewRequest
      ? http.post<IAPIEtpScenarioDetail>(apiUrls.etpScenario, request.serialize())
      : http.put<IAPIEtpScenarioDetail>(`${apiUrls.etpScenario}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIEtpScenarioDetail) => EtpScenarioDetailModel.deserialize(response)),
      tap(() => AlertStore.info(`ETP Scenario ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getEtpScenarioById(id: number): Observable<EtpScenarioDetailModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get<IAPIEtpScenarioDetail>(`${apiUrls.etpScenarioById(id)}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => EtpScenarioDetailModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public uploadEtpScenarioData(file: File): Observable<IAPIImportEtpScenario> {
    const data: FormData = new FormData();
    data.append('file', file);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft, headers: { HasFile: true } });
    return http.post<IAPIImportEtpScenario>(apiUrls.etpScenarioImport, data).pipe(
      Logger.observableCatchError,
      map(({ hasAllSuccess, etpScenarioImportErrors }) => {
        return { hasAllSuccess, message: etpScenarioImportErrors?.join(',') || '' };
      })
    );
  }
}
