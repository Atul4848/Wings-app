import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { IAPIDNDFilter } from '../Interfaces';
import { DNDFilterModel, UserModel } from '../Models';
import { observable } from 'mobx';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { apiUrls } from './API.url';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIPagedUserRequest, IAPIUserResponse } from '@wings/user-management/src/Modules';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { IAPIPascalResponse, Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class DNDFilterStore extends BaseStore {
  @observable public dndFilters: DNDFilterModel[] = [];

  /* istanbul ignore next */
  public getDNDFilters(): Observable<DNDFilterModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIDNDFilter[]>>(apiUrls.dndFilters).pipe(
      Logger.observableCatchError,
      map(response => DNDFilterModel.deserializeList(response.Data)),
      tap((dndFilters: DNDFilterModel[]) => (this.dndFilters = dndFilters))
    );
  }

  /* istanbul ignore next */
  public removeDNDFilter({ id }: DNDFilterModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.delete<IAPIResponse<boolean>>(apiUrls.dndFiltersById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => {
        return response.Data;
      }),
      tap(() => AlertStore.info('DND Filter deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public loadDNDFilterById(id: number): Observable<DNDFilterModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIDNDFilter>>(apiUrls.dndFiltersById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIDNDFilter>) => DNDFilterModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public upsertDNDFilter(dndFilter: DNDFilterModel): Observable<DNDFilterModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = dndFilter.id === 0;
    const upsertRequest: Observable<IAPIResponse<IAPIDNDFilter>> = isNewRequest
      ? http.post<IAPIResponse<IAPIDNDFilter>>(apiUrls.dndFilters, dndFilter.serialize())
      : http.put<IAPIResponse<IAPIDNDFilter>>(apiUrls.dndFilters, dndFilter.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIDNDFilter>) => DNDFilterModel.deserialize(response.Data)),
      catchError(err => {
        AlertStore.critical(err.message);
        return throwError(err);
      }),
      tap(() => AlertStore.info(`DND Filter ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public loadUsers(request?: IAPIPagedUserRequest): Observable<UserModel[]> {
    const params = Utilities.buildParamString({
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPIPascalResponse<IAPIUserResponse>>>(`${apiUrls.user}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => UserModel.deserializeList(response.Data.Results))
    );
  }
}
