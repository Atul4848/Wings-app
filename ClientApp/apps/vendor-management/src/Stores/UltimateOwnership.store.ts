import {
  HttpClient,
  baseApiPath,
} from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { UltimateOwnershipModel } from '../Modules/Shared/Models';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { IAPIResponseVendor } from '../Modules/Shared/Interfaces/Response/API-Response-Vendor';
import { IAPIResponseOwnership } from '../Modules/Shared/Interfaces/Response/API-Response-Ownership';
import { COLLECTION_NAMES } from '../Modules/Shared/Enums/CollectionName.enum';
  
export class UltimateOwnershipStore {
    @observable public vendorOwner: UltimateOwnershipModel[] = [];
    @observable public isUboChecked: boolean = false;
  
    @action
    public getVendorOwner(
      pageRequest?: IAPIGridRequest, 
      collectionName?: COLLECTION_NAMES
    ): Observable<IAPIPageResponse<IAPIResponseOwnership>> {
      const http: HttpClient = new HttpClient({
        baseURL: baseApiPath.vendorManagementNoSqlUrl,
        headers: vendorManagementHeaders,
      });
      const params: string = Utilities.buildParamString({
        CollectionName: collectionName,
        ...pageRequest,
      });
      return http.get<IAPIPageResponse<IAPIResponseVendor>>(`/${apiUrls.vendorManagement}?${params}`).pipe(
        Logger.observableCatchError,
        map(response => {
          collectionName === 'Vendor' ? 
            this.vendorOwner = UltimateOwnershipModel.deserializeList(response.results[0].vendorOwnership )
            : 
            this.vendorOwner = UltimateOwnershipModel.deserializeList(response.results[0].vendorLocationOwnership )
          return { ...response, results: this.vendorOwner };
        })
      );
    }
  
    public upsertVendorOwner(payload: UltimateOwnershipModel[]): Observable<UltimateOwnershipModel> {
      const http = new HttpClient({ headers: vendorManagementHeaders });
      payload[0].id = payload[0].id === null ? 0 : payload[0].id;
      const isNewRequest: boolean = !(payload[0].id != null && payload[0].id !== 0);
      const upsertRequest: Observable<UltimateOwnershipModel> = isNewRequest
        ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOwnership}`, payload)
        : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOwnership}`, payload);
      return upsertRequest.pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Owner data saved successfully!')),
        map(response => UltimateOwnershipModel.deserialize(response))
      );
    }

    public upsertVendorLocationOwner(payload: UltimateOwnershipModel[]): Observable<UltimateOwnershipModel> {
      const http = new HttpClient({ headers: vendorManagementHeaders });
      payload[0].id = payload[0].id === null ? 0 : payload[0].id;
      const isNewRequest: boolean = !(payload[0].id != null && payload[0].id !== 0);
      const upsertRequest: Observable<UltimateOwnershipModel> = isNewRequest
        ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationOwnership}`, payload)
        : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationOwnership}`, payload);
      return upsertRequest.pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Owner Location data saved successfully!')),
        map(response => UltimateOwnershipModel.deserialize(response[0]))
      );
    }
}
  