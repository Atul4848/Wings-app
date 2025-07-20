import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { ContactMasterModel } from '../Modules/Shared/Models/ContactMaster.model';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { VendorContact } from '../Modules/Shared/Models/VendorContact.model';
import { ServiceCommunicationPreferenceModel } from '../Modules/Shared/Models/ServiceCommunicationPreference.model';
import { COLLECTION_NAMES } from '../Modules/Shared/Enums/CollectionName.enum';
import { VendorLocationContactModel } from '../Modules/Shared/Models/VendorLocationContact.model';
import { IAPIRequestVendorLocationContact } from 
  '../Modules/Shared/Interfaces/Request/API-Request-VendorLocationContact.interface';
import { Airports } from '../Modules/Shared';

export class ContactMasterStore {
  @observable public contactList: ContactMasterModel[] = [];
  @observable public vendorContactList: VendorContact[] = [];
  @observable public vendorLocationServiceCommList: ServiceCommunicationPreferenceModel[] = [];
  @observable public vendorLocationContactList: VendorLocationContactModel[] = [];
  @observable public selectedAirport: Airports = null;

  @action
  public getVMSComparison(
    collectionName: COLLECTION_NAMES,
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<ContactMasterModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: collectionName,
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`/${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        const results = this.getDeserializeList(response.results, collectionName);
        return { ...response, results: results };
      })
    );
  }

  @action
  public upsertMasterContact(payload: ContactMasterModel): Observable<ContactMasterModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<ContactMasterModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorMasterContact}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorMasterContact}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Contact data saved successfully!'))
    );
  }

  @action
  public upsertVendorContact(payload: VendorContact, isInvitationSent?: boolean): Observable<VendorContact> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<VendorContact> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorContact}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorContact}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() =>
        isInvitationSent
          ? AlertStore.info('Onboarding Mail has been sent successfully!')
          : AlertStore.info('Vendor Contact data saved successfully!')
      )
    );
  }

  @action
  public upsertServiceCommGrid(
    payload: ServiceCommunicationPreferenceModel
  ): Observable<ServiceCommunicationPreferenceModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<ServiceCommunicationPreferenceModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationServiceCommunication}`, payload)
      : http.put<any>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationServiceCommunication}/${payload.id}`,
        payload
      );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Data saved successfully!')),
      map(res => ServiceCommunicationPreferenceModel.deserialize(res))
    );
  }

  @action
  public upsertVendorLocationContact(
    payload: IAPIRequestVendorLocationContact
  ): Observable<VendorLocationContactModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const id = payload.ids ? payload.ids[0] : 0;
    const isNewRequest: boolean = !(id != null && id !== 0);
    const upsertRequest: Observable<VendorLocationContactModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationContact}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationContact}/${id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Data saved successfully!')),
      map(res => VendorLocationContactModel.deserializeList(res[0] ? res : [ res ]))
    );
  }

  public getDeserializeList(results: any[], collectionName?: COLLECTION_NAMES): any {
    switch (collectionName) {
      case COLLECTION_NAMES.CONTACT:
        this.contactList = ContactMasterModel.deserializeList(results);
        return this.contactList;
      case COLLECTION_NAMES.VENDOR_CONTACT:
        this.vendorContactList = VendorContact.deserializeList(results);
        return this.vendorContactList;
      case COLLECTION_NAMES.SERVICE_COMM:
        this.vendorLocationServiceCommList = ServiceCommunicationPreferenceModel.deserializeList(results);
        return this.vendorLocationServiceCommList;
      case COLLECTION_NAMES.VENDOR_LOCATION_CONTACT:
        this.vendorLocationContactList = VendorLocationContactModel.deserializeList(results);
        return this.vendorLocationContactList;
    }
  }
}
