import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { IAPIApplicationOktaClientResponse, IAPIApplicationsResponse } from '../Interfaces';
import { ApplicationsModel, ApplicationOktaClientModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { observable } from 'mobx';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class ApplicationsStore extends BaseStore {
  @observable public applications: ApplicationsModel[] = [];

  /* istanbul ignore next */
  public getApplication(id: string): Observable<ApplicationsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPIApplicationsResponse>>(`${apiUrls.applications}/${id}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIApplicationsResponse>) => ApplicationsModel.deserialize(response.Data))
    )
  }

  /* istanbul ignore next */
  public getApplications(request?: IAPIGridRequest): Observable<IAPIPageResponse<ApplicationsModel>> {
    const params = Utilities.buildParamString({
      q: request?.searchCollection || '',
      page: request?.pageNumber || 1,
      size: request?.pageSize || 50,
      sort: 'Name',
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPageResponse<IAPIApplicationsResponse>>(`${apiUrls.applications}?${params}`).pipe(
      Logger.observableCatchError,
      map((response) => {
        this.applications = Utilities.customArraySort<ApplicationsModel>
        (ApplicationsModel.deserializeList(response.Data.Results), 'Name');
        return {
          totalNumberOfRecords: response.Data.TotalNumberOfRecords,
          pageNumber: response.Data.PageNumber,
          pageSize: response?.Data.PageSize,
          results: Utilities.customArraySort<ApplicationsModel>
          (ApplicationsModel.deserializeList(response.Data.Results), 'Name'),
        }
      })
    )
  }

  /* istanbul ignore next */
  public upsertApplication(
    id: string,
    application: ApplicationsModel,
    isNewRequest: boolean): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const upsertRequest: Observable<IAPIResponse<boolean>> = isNewRequest
      ? http.post<IAPIResponse<boolean>>(apiUrls.applications, application.serialize())
      : http.put<IAPIResponse<boolean>>(`${apiUrls.applications}/${id}`, application.serialize());
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => {
        AlertStore.info(`Application ${isNewRequest ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public searchOktaClient(query: string): Observable<ApplicationOktaClientModel[]> {
    const params = Utilities.buildParamString({
      query: query || '',
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPIApplicationOktaClientResponse>>(`${apiUrls.oktaApplications}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ApplicationOktaClientModel.deserializeList(response?.Data ?? []))
    );
  }

}