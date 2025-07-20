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
import { BankInformation } from '../Modules/Shared/Models/BankInformation.model';

export class BankInformationStore {
    @observable public vendorBank: BankInformation[] = [];
    @observable isCountryReferenceRequired:boolean=false;

    @action
    public getVendorBankInformation(
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
            this.vendorBank = BankInformation.deserializeList(response.results[0].vendorBank )
            : 
            this.vendorBank = BankInformation.deserializeList(response.results[0].vendorLocationBank )
          return { ...response, results: this.vendorBank };
        })
      );
    }

    public upsertBankInformation(payload: BankInformation): Observable<BankInformation> {
      const http = new HttpClient({ headers: vendorManagementHeaders });
      payload.id = payload.id === null ? 0 : payload.id;
      const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
      const upsertRequest: Observable<BankInformation> = isNewRequest
        ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorBank}`, payload)
        : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorBank}/${payload.id}`, payload);
      return upsertRequest.pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Vendor Bank Information data saved successfully!')),
        map(response => BankInformation.deserialize(response))
      );
    }

    @action
    public upsertVendorLocationBankInformation(payload: BankInformation): Observable<BankInformation> {
      const http = new HttpClient({ headers: vendorManagementHeaders });
      payload.id = payload.id === null ? 0 : payload.id;
      const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
      const upsertRequest: Observable<BankInformation> = isNewRequest
        ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationBank}`, payload)
        : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationBank}/${payload.id}`, payload);
      return upsertRequest.pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Vendor Location Bank Information data saved successfully!')),
        map(response => BankInformation.deserialize(response))
      );
    }

}
