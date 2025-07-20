import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { IAPIResponseVendor } from '../Modules/Shared/Interfaces/Response/API-Response-Vendor';
import { IAPIResponseOwnership } from '../Modules/Shared/Interfaces/Response/API-Response-Ownership';
import { COLLECTION_NAMES } from '../Modules/Shared/Enums/CollectionName.enum';
import { OrderSoftwareModel } from '../Modules/Shared/Models/OrderSoftware.model';

export class OrderSoftwareStore {
    @observable public orderSoftware: OrderSoftwareModel[] = [];

    @action
    public getVendorOrderSoftware(
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
          this.orderSoftware = OrderSoftwareModel.deserializeList(response.results[0].vendorLocationOrderManagement
          )
          return { ...response, results: this.orderSoftware };
        })
      );
    }

    @action
    public upsertVendorLocationOrderSoftware(payload: OrderSoftwareModel): Observable<OrderSoftwareModel> {
      const http = new HttpClient({ headers: vendorManagementHeaders });
      payload.id = payload.id === null ? 0 : payload.id;
      const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
      const upsertRequest: Observable<OrderSoftwareModel> = isNewRequest
        ? http.post(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationOrderManagement}`, payload)
        : http.put(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationOrderManagement}/${payload.id}`, payload);
      return upsertRequest.pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Order Software data saved successfully!')),
        map(response => OrderSoftwareModel.deserialize(response))
      );
    }

}
