import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { IAPIServicesResponse } from '../Interfaces';
import { CustomerModel, RolesModel, ServicesModel, SiteModel } from '../Models';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { action, observable } from 'mobx';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class ServicesStore extends BaseStore {
  @observable public services: ServicesModel[] = [];
  @observable public rolesField : RolesModel[] = [];
  @observable public inputList: any = [
    { customer: CustomerModel, site: SiteModel, service: ServicesModel, role: RolesModel },
  ];

  @action
  public setRolesField = (roles: RolesModel[]) =>{
    this.rolesField= roles;
  }

  @action
  public setInputList = (site: SiteModel[]) =>{
    this.inputList= site.map(x => ({
      site: new SiteModel({ number: x?.number, siteUseId: x.siteUseId }),
      service: new ServicesModel({ name: x.services?.join(', ') }),
    }))
  }

  /* istanbul ignore next */
  public getService(id: string): Observable<ServicesModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPIServicesResponse>>(`${apiUrls.services}/${id}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIServicesResponse>) => ServicesModel.deserialize(response.Data))
    )
  }

  /* istanbul ignore next */
  public getServices(request?: IAPIGridRequest, roleFilter = 'All'): Observable<IAPIPageResponse<ServicesModel>> {
    const params = Utilities.buildParamString({
      q: request?.searchCollection || '',
      page: request?.pageNumber || 1,
      size: request?.pageSize || 50,
      sort: 'Name',
      roleFilter,
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPageResponse<IAPIServicesResponse>>(`${apiUrls.services}?${params}`).pipe(
      Logger.observableCatchError,
      map((response) => {
        if(!request?.searchCollection){
          this.services = Utilities.customArraySort<ServicesModel>
          (ServicesModel.deserializeList(response.Data.Results), 'Name');
        }
        return {
          totalNumberOfRecords: response.Data.TotalNumberOfRecords,
          pageNumber: response.Data.PageNumber,
          pageSize: response?.Data.PageSize,
          results: Utilities.customArraySort<ServicesModel>
          (ServicesModel.deserializeList(response.Data.Results), 'Name'),
        }
      })
    )
  }

  /* istanbul ignore next */
  public upsertService(
    id: string,
    service: ServicesModel,
    isNewRequest: boolean): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    const upsertRequest: Observable<IAPIResponse<boolean>> = isNewRequest
      ? http.post<IAPIResponse<boolean>>(apiUrls.services, service.serialize())
      : http.put<IAPIResponse<boolean>>(`${apiUrls.services}/${id}`, service.serialize());
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => {
        AlertStore.info(`Service ${isNewRequest ? 'created' : 'updated'} successfully.`);
      })
    );
  }

  /* istanbul ignore next */
  public deleteService(id: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.services}/${id}`)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<boolean>) => response.Data)
      );
  }
}