import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { VendorLocationModel, VendorPricingModel } from '../Modules/Shared/Models';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';
import { AuthStore, Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { ServiceItemPricingModel } from '../Modules/Shared/Models/ServiceItemPricing.model';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { ServiceItemPricingLocationModel } from '../Modules/Shared/Models/ServiceItemPricingLocation.model';

export class ServiceItemPricingStore {
  @observable test: string = '';
  @observable isDirectService: boolean = true;
  @observable isCommentFieldRequired: boolean = false;
  @observable vendorLocationData: VendorLocationModel = new VendorLocationModel();

  @action
  public getVMSComparison(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<ServiceItemPricingModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'ServiceItemPricing',
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`/api/vendormanagement?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: ServiceItemPricingModel.deserializeList(response.results) }))
    );
  }

  @action
  public upsertServiceItemPricing(payload: ServiceItemPricingModel[]): Observable<ServiceItemPricingModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload[0].id = payload[0].id === null ? 0 : payload[0].id;
    const isNewRequest: boolean = !(payload[0].id != null && payload[0].id !== 0);
    const upsertRequest: Observable<ServiceItemPricingModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricing}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricing}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor ServiceItemPricing data saved successfully!'))
    );
  }

  @action
  public upsertServiceItemPricingLocations(
    payload: ServiceItemPricingLocationModel[]
  ): Observable<ServiceItemPricingLocationModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload[0].id = payload[0].id === null ? 0 : payload[0].id;
    const isNewRequest: boolean = !(payload[0].id != null && payload[0].id !== 0);
    const upsertRequest: Observable<ServiceItemPricingLocationModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricing}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricing}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor ServiceItemPricing data saved successfully!'))
    );
  }

  public removePricing(serviceItemPricingId: number): Observable<string> {
    const payload = {
      userId: 'string',
      serviceItemPricingId: [ serviceItemPricingId ],
    };
    const http = new HttpClient({ headers: vendorManagementHeaders });
    return http.delete<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricing}`, payload).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Vendor Pricing data deleted successfully!'))
    );
  }

  public downloadPricing(): Observable<File> {
    const http = new HttpClient({ headers: vendorManagementHeaders, responseType: 'blob' });
    return http
      .get(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.downloadTemplete}/downloadtemplate`)
      .pipe(Logger.observableCatchError);
  }

  @action
  public uploadPricingExcel(file: File): Observable<string> {
    const data: FormData = new FormData();
    data.append('userId', AuthStore.user.preferred_username);
    data.append('excelTemplate', file);
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<string>(`${apiUrls.downloadTemplete}/uploadtemplate`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response }))
    );
  }
}
