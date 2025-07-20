import { baseApiPath, HttpClient, SettingsBaseStore } from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EtpPolicyModel } from '..';
import { IAPIEtpPolicy, IAPIImportEtpPolicy } from '../Interfaces';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';
import { tapWithAction, Utilities } from '@wings-shared/core';

export class EtpPolicyStore extends SettingsBaseStore {
  @observable public etpPolicies: EtpPolicyModel[] = [];

  constructor() {
    super(baseApiPath.aircraft);
  }

  /* istanbul ignore next */
  public getEtpPolicies(forceRefresh?: boolean): Observable<EtpPolicyModel[]> {
    return this.getResult(apiUrls.etpPolicy, this.etpPolicies, forceRefresh, EtpPolicyModel.deserializeList).pipe(
      map(etpPolicies => Utilities.customArraySort(etpPolicies, 'code')),
      tapWithAction(etpPolicies => (this.etpPolicies = etpPolicies))
    );
  }

  /* istanbul ignore next */
  public upsertEtpPolicy(request: EtpPolicyModel): Observable<EtpPolicyModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.etpPolicy, 'ETP Policy').pipe(
      map(response => EtpPolicyModel.deserialize(response)),
      tapWithAction((etpPolicy: EtpPolicyModel) => {
        this.etpPolicies = Utilities.updateArray<EtpPolicyModel>(this.etpPolicies, etpPolicy, {
          replace: !isNewRequest,
          predicate: t => t.id === etpPolicy.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public importEtpPolicies(file: File): Observable<IAPIImportEtpPolicy> {
    const data: FormData = new FormData();
    data.append('file', file);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft, headers: { HasFile: true } });
    return http.post<IAPIImportEtpPolicy>(apiUrls.etpPolicyImport, data).pipe(
      Logger.observableCatchError,
      map(({ hasAllSuccess, etpPolicyImportErrors }: IAPIImportEtpPolicy) => {
        return { hasAllSuccess, message: etpPolicyImportErrors?.join(',') || '' };
      })
    );
  }

  /* istanbul ignore next */
  public getEtpPolicyById(id: number): Observable<EtpPolicyModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get<IAPIEtpPolicy>(`${apiUrls.etpPolicyById(id)}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => EtpPolicyModel.deserialize(response))
    );
  }

  public isAlreadyExists(etpPolicy: EtpPolicyModel): boolean {
    return this.etpPolicies?.some(x => x.code === etpPolicy.code && x.id !== etpPolicy.id);
  }
}
