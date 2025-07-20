import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseStore } from './Base.store';
import { HttpClient } from '../Tools';
import { observable } from 'mobx';
import { vendorApiUrls } from './ApiUrls';
import { baseApiPath } from '../API';
import { EntityMapModel, Utilities, IAPIGridRequest, tapWithAction } from '@wings-shared/core';
import { Logger } from '@wings-shared/security';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { BulletinEntityModel } from '../Components/Bulletins/Models';

export class BaseVendorStore extends BaseStore {
  private env = new EnvironmentVarsStore();
  private vendorManagementHeaders = {
    'Ocp-Apim-Subscription-Key': this.env.getVar(ENVIRONMENT_VARS.VENDOR_MANAGEMENT_SUBSCRIPTION_KEY),
    'Ocp-Apim-Trace': true,
  };

  @observable public vendors: EntityMapModel[] = [];
  @observable public vendorLocations: EntityMapModel[] = [];
  public getVendors(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: this.vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'Vendor',
      ...pageRequest,
    });
    return http.get(`/${vendorApiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(({ results }) =>
        results.map(
          x =>
            new EntityMapModel({
              entityId: x.id,
              name: x.name,
              code: x.code,
            })
        )
      ),
      tapWithAction(response => (this.vendors = response))
    );
  }
  public getVendorLocations(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: this.vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorLocation',
      ...pageRequest,
    });
    return http.get(`/${vendorApiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.vendorLocations = response.results?.map(
          x =>
            new EntityMapModel({
              ...x,
              entityId: x.id,
              id: 0,
              code:
                x.airportReference?.displayCode ||
                x.airportReference?.icaoCode ||
                x.airportReference?.uwaCode ||
                x.airportReference?.iataCode ||
                x.airportReference?.faaCode ||
                x.airportReference?.regionalCode,
            })
        );
        return this.vendorLocations;
      })
    );
  }

  // only for BulletinEntity field of airport bulletins
  public getVendorLocationsV2(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: this.vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorLocation',
      ...pageRequest,
    });
    return http.get(`/${vendorApiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.vendorLocations = response.results?.map(
          x =>
            new BulletinEntityModel({
              ...x,
              entityId: x.id,
              id: 0,
              airportCode:
                x.airportReference?.displayCode ||
                x.airportReference?.icaoCode ||
                x.airportReference?.uwaCode ||
                x.airportReference?.iataCode ||
                x.airportReference?.faaCode ||
                x.airportReference?.regionalCode,
            })
        );
        return this.vendorLocations;
      })
    );
  }
}
