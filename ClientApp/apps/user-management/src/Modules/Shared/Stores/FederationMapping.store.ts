import { baseApiPath, BaseStore, HttpClient, VIEW_MODE } from '@wings/shared';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { IAPIFederationMapping, IAPIFederationMappingRequest } from '../Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { FederationMappingModel } from '../Models';
import { observable } from 'mobx';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class FederationMappingStore extends BaseStore {
  @observable public federationMapping: FederationMappingModel[] = [];

  /* istanbul ignore next */
  public loadFederation(): Observable<FederationMappingModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIFederationMapping[]>>(apiUrls.federationMapping).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIFederationMapping[]>) => {
        return this.federationMapping = Utilities.customArraySort<FederationMappingModel>
        (FederationMappingModel.deserializeList(response.Data), 'customerNumber');
      }))
  }

  /* istanbul ignore next */
  public upsertIdpMapping(
    upsertIdpMappingRequest: IAPIFederationMappingRequest,
    mode: VIEW_MODE): Observable<FederationMappingModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const isNewRequest: boolean = mode === VIEW_MODE.NEW;
    const upsertRequest: Observable<IAPIResponse<IAPIFederationMappingRequest>> = isNewRequest
      ? http.post<IAPIResponse<IAPIFederationMappingRequest>>(apiUrls.federationMapping, upsertIdpMappingRequest)
      : http.put<IAPIResponse<IAPIFederationMappingRequest>>(apiUrls.federationMapping, upsertIdpMappingRequest);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIFederationMapping>) =>
        FederationMappingModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Federation ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteFederation(identityProvider: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.federationMapping}?id=${identityProvider}`)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<boolean>) => response.Data)
      );
  }
}
