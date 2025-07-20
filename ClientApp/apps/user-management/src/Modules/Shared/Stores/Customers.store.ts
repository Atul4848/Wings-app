import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { IAPICustomerResponse } from '../Interfaces';
import { CustomerModel, RolesModel, ServicesModel, SiteModel, UserModel } from '../Models';
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

export class CustomersStore extends BaseStore {
  @observable public customerFilter: string = 'ACTIVE';
  @observable public customer: CustomerModel[] = [];
  @observable public sites: SiteModel[] = [];
  @observable public site: SiteModel = new SiteModel();
  @observable public roleIds: [] = [];
  @observable public selectedSiteNumber: string = '';
  @observable public filterValues: {service: ServicesModel, roles: RolesModel[], sites: SiteModel} = {
    service: new ServicesModel(),
    sites: new SiteModel(),
    roles: []
  };

  public setCustomerFilter(filter: string) {
    this.customerFilter = filter;
  }

  @action
  public setSitesField = (site: SiteModel[]) => {
    this.sites = site;
  }

  public setSiteNumber = (siteNumber: string) => {
    this.selectedSiteNumber = siteNumber;
  }

  public setFilterValues(filter) {
    this.filterValues = filter;
  }

  public setSiteFilter(filter: SiteModel) {
    this.site = filter;
  }

  public setRoleIdsFilter(filter: []) {
    this.roleIds = filter;
  }

  /* istanbul ignore next */
  public getCustomer(id: string): Observable<CustomerModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIResponse<IAPICustomerResponse>>(`${apiUrls.customers}/${id}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPICustomerResponse>) => CustomerModel.deserialize(response.Data))
    )
  }
 
  /* istanbul ignore next */
  public getCustomers(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerModel>> {
    const params = Utilities.buildParamString({
      q: request?.searchCollection || '',
      page: request?.pageNumber || 1,
      size: request?.pageSize || 50,
      status: request?.status,
      sort: 'name',
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPageResponse<IAPICustomerResponse>>(`${apiUrls.customers}?${params}`).pipe(
      Logger.observableCatchError,
      map((response) => {
        if(!request?.searchCollection){
          this.customer = Utilities.customArraySort<CustomerModel>
          (CustomerModel.deserializeList(response.Data.Results), 'Name');
        }
        return {
          totalNumberOfRecords: response.Data.TotalNumberOfRecords,
          pageNumber: response.Data.PageNumber,
          pageSize: response?.Data.PageSize,
          results: Utilities.customArraySort<CustomerModel>
          (CustomerModel.deserializeList(response.Data.Results), 'Name'),
        }
      })
    )
  }

  /* istanbul ignore next */
  public getCustomerUsers(id: string, request?: IAPIGridRequest): Observable<IAPIPageResponse<UserModel>> {
    const paramsObj : any= {
      q: request?.q || '',
      Page: request?.pageNumber || 1,
      Size: request?.pageSize || 30,
      site: this.selectedSiteNumber,
    };
    let addParams='';
    if (request?.site) {
      addParams += `&Site=${request?.site}`
    }
    if (request?.roleIds?.length) {
      request.roleIds.forEach(element => {
        addParams += `&RoleIds=${element}`
      });
    }
    const params = Utilities.buildParamString(paramsObj);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement, headers });
    return http.get<IAPIPageResponse<IAPICustomerResponse>>(`${apiUrls.customerUsers}/${id}/users?${params}${addParams}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return {
          totalNumberOfRecords: response.Data.TotalNumberOfRecords,
          pageNumber: response.Data.PageNumber,
          pageSize: response?.Data.PageSize,
          results: Utilities.customArraySort<UserModel>(UserModel.deserializeList(response.Data.Results), 'Username'),
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertCustomer(
    customerId: string,
    customer: CustomerModel,
  ): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement });
    return http.put<IAPIResponse<boolean>>(`${apiUrls.customers}/${customerId}`, customer.serialize()).pipe(
      Logger.observableCatchError,
    );
  }

  /* istanbul ignore next */
  public deleteCustomer(id: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.userManagement });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.customers}/${id}`)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<boolean>) => response.Data)
      );
  }
}