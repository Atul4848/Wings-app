import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Logger } from '@wings-shared/security';
import { HttpClient, NO_SQL_COLLECTIONS, SettingsBaseStore, baseApiPath } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIGridRequest, IAPIPageResponse, IdNameCodeModel, Utilities, tapWithAction } from '@wings-shared/core';
import {
  AssociatedSpecialCareModel,
  CustomerModel,
  AssociatedOfficeModel,
  AssociatedRegistrySiteModel,
  AssociatedSitesModel,
  AssociatedRegistriesModel,
  AssociatedOperatorsModel,
  CustomerContactModel,
  ContactCommunicationFlatViewModel,
  ImportCustomsDecalModel,
  CustomerProfileModel,
} from '../Models';
import {
  IAPIAssociatedSpecialCare,
  IAPICustomer,
  IAssociatedSpecialCareRequest,
  IAPIAssociatedOffice,
  IAPIAssociatedRegistrySite,
  IAPIContactCommunication,
  IAPICommunicationFlatView,
  IAPIImportCustomsDecal,
} from '../Interfaces';
import { apiUrls } from './API.url';
import { IAPICustomerProfile } from '../Interfaces/API-CustomerProfile.interface';

export class CustomerStore extends SettingsBaseStore {
  @observable public customers: CustomerModel[] = [];
  @observable public customerList: IdNameCodeModel[] = [];
  @observable public selectedCustomer: CustomerModel = new CustomerModel();
  @observable public associatedSpecialCares: AssociatedSpecialCareModel[] = [];
  @observable public associatedOffices: AssociatedOfficeModel[] = [];
  @observable public associatedRegistrySites: AssociatedRegistrySiteModel[] = [];
  @observable public associatedSites: AssociatedSitesModel[] = [];
  @observable public associatedRegistries: AssociatedRegistriesModel[] = [];
  @observable public associatedOperators: AssociatedOperatorsModel[] = [];
  @observable public contacts: CustomerContactModel[] = [];
  @observable public searchContacts: CustomerContactModel[] = [];
  @observable public selectedContact: CustomerContactModel = new CustomerContactModel();
  @observable public customerProfile: CustomerProfileModel = new CustomerProfileModel();

  constructor(baseUrl?: string) {
    super(baseUrl || '');
  }

  /* istanbul ignore next */
  public getContactsNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerContactModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.CONTACT,
      sortCollection: JSON.stringify([{ propertyName: 'Status.Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIContactCommunication>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CustomerContactModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getContactNoSqlById(request?: IAPIGridRequest): Observable<CustomerContactModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.CONTACT,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIContactCommunication>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => CustomerContactModel.deserialize(response.results[0])),
      tapWithAction(res => (this.selectedContact = res))
    );
  }

  /* istanbul ignore next */
  public getCommunicationsNoSql(
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<ContactCommunicationFlatViewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.COMMUICATIONS,
      sortCollection: JSON.stringify([{ propertyName: 'Status.Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICommunicationFlatView>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: ContactCommunicationFlatViewModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getCustomersNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.CUSTOMER,
      sortCollection: JSON.stringify([{ propertyName: 'Status.Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICustomer>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CustomerModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertCustomer(customer: CustomerModel): Observable<CustomerModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddCustomer: boolean = customer.id === 0;
    const upsertRequest: Observable<IAPICustomer> = isAddCustomer
      ? http.post<IAPICustomer>(apiUrls.customer, customer.serialize())
      : http.put<IAPICustomer>(`${apiUrls.customer}/${customer.id}`, customer.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPICustomer) => CustomerModel.deserialize(response)),
      tapWithAction((customer: CustomerModel) => {
        this.customers = Utilities.updateArray<CustomerModel>(this.customers, customer, {
          replace: !isAddCustomer,
          predicate: t => t.id === customer.id,
        });
        return AlertStore.info(`Customer ${isAddCustomer ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getContacts(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerContactModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICustomer>>(`${apiUrls.contact}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CustomerContactModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertContact(contact: CustomerContactModel, communicationId: number): Observable<CustomerContactModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddContact: boolean = communicationId === 0;
    const upsertRequest: Observable<IAPIContactCommunication> = isAddContact
      ? http.post<IAPIContactCommunication>(apiUrls.contact, contact.serialize(communicationId))
      : http.put<IAPIContactCommunication>(`${apiUrls.contact}/${contact.id}`, contact.serialize(communicationId));

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIContactCommunication) => CustomerContactModel.deserialize(response)),
      tapWithAction((contact: CustomerContactModel) => {
        this.contacts = Utilities.updateArray<CustomerContactModel>(this.contacts, contact, {
          replace: !isAddContact,
          predicate: t => t.id === contact.id,
        });
        return AlertStore.info(`Contact ${isAddContact ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getContactById(contactId: number): Observable<CustomerContactModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http
      .get<IAPIContactCommunication>(`${apiUrls.contact}/${contactId}`)
      .pipe(map(response => CustomerContactModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public getCustomerById(customerId: number): Observable<CustomerModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http
      .get<IAPICustomer>(`${apiUrls.customer}/${customerId}`)
      .pipe(map(response => CustomerModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public getCustomerNoSqlById(request?: IAPIGridRequest): Observable<CustomerModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.CUSTOMER,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICustomer>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => CustomerModel.deserialize(response.results[0])),
      tapWithAction(res => (this.selectedCustomer = res))
    );
  }

  /* istanbul ignore next */
  public getAssociatedSpecialCares(
    customerNumber: string,
    request?: IAPIGridRequest
  ): Observable<AssociatedSpecialCareModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIAssociatedSpecialCare>>(
        `${apiUrls.customerAssociatedSpecialCare(customerNumber)}?${params}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => AssociatedSpecialCareModel.deserializeList(response.results))
      );
  }

  /* istanbul ignore next */
  public upsertAssociatedSpecialCare(
    request: AssociatedSpecialCareModel,
    partyId: number
  ): Observable<AssociatedSpecialCareModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddNew: boolean = request.id === 0;
    const upsertRequest: Observable<IAssociatedSpecialCareRequest> = isAddNew
      ? http.post<IAssociatedSpecialCareRequest>(
        apiUrls.customerAssociatedSpecialCare(request.customer.number),
        request.serialize(partyId)
      )
      : http.put<IAssociatedSpecialCareRequest>(
        `${apiUrls.customerAssociatedSpecialCare(request.customer.number)}/${request.id}`,
        request.serialize(partyId)
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAssociatedSpecialCare) => AssociatedSpecialCareModel.deserialize(response)),
      tapWithAction((responseModel: AssociatedSpecialCareModel) => {
        this.associatedSpecialCares = Utilities.updateArray<AssociatedSpecialCareModel>(
          this.associatedSpecialCares,
          responseModel,
          {
            replace: !isAddNew,
            predicate: t => t.id === responseModel.id,
          }
        );
        return AlertStore.info(`Associated SpecialCare ${isAddNew ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getAssociatedOffice(customerNumber: string, request?: IAPIGridRequest): Observable<AssociatedOfficeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIAssociatedOffice>>(`${apiUrls.customerAssociatedOffice(customerNumber)}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => AssociatedOfficeModel.deserializeList(response.results)),
        tapWithAction(resp => (this.associatedOffices = resp))
      );
  }
  /* istanbul ignore next */
  public upsertAssociatedOffice(
    associatedOffice: AssociatedOfficeModel,
    partyId: number
  ): Observable<AssociatedOfficeModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddAssociatedOffice: boolean = associatedOffice.id === 0;
    const upsertRequest: Observable<IAPIAssociatedOffice> = isAddAssociatedOffice
      ? http.post<IAPIAssociatedOffice>(
        apiUrls.customerAssociatedOffice(associatedOffice.customer.number),
        associatedOffice.serialize(partyId)
      )
      : http.put<IAPIAssociatedOffice>(
        `${apiUrls.customerAssociatedOffice(associatedOffice.customer.number)}/${associatedOffice.id}`,
        associatedOffice.serialize(partyId)
      );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAssociatedOffice) => AssociatedOfficeModel.deserialize(response)),
      tapWithAction((associatedOffice: AssociatedOfficeModel) => {
        this.associatedOffices = Utilities.updateArray<AssociatedOfficeModel>(
          this.associatedOffices,
          associatedOffice,
          {
            replace: !isAddAssociatedOffice,
            predicate: t => t.id === associatedOffice.id,
          }
        );
        return AlertStore.info(`Associated Office ${isAddAssociatedOffice ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getAssociatedRegistrySites(
    customerNumber: string,
    customerassociatedregistryId: number,
    request?: IAPIGridRequest
  ): Observable<AssociatedRegistrySiteModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIAssociatedRegistrySite>>(
        `${apiUrls.customerAssociatedRegistrySite(customerNumber, customerassociatedregistryId)}?${params}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => AssociatedRegistrySiteModel.deserializeList(response.results)),
        tapWithAction(resp => (this.associatedRegistrySites = resp))
      );
  }

  /* istanbul ignore next */
  public upsertAssociatedRegistrySite(
    associatedRegistrySite: AssociatedRegistrySiteModel,
    customerNumber: string,
    customerassociatedregistryId: number
  ): Observable<AssociatedRegistrySiteModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddAssociatedRegistrySite: boolean = associatedRegistrySite.id === 0;
    const upsertRequest: Observable<IAPIAssociatedRegistrySite> = isAddAssociatedRegistrySite
      ? http.post<IAPIAssociatedRegistrySite>(
        apiUrls.customerAssociatedRegistrySite(customerNumber, customerassociatedregistryId),
        associatedRegistrySite.serialize(customerNumber, customerassociatedregistryId)
      )
      : http.put<IAPIAssociatedRegistrySite>(
        `${apiUrls.customerAssociatedRegistrySite(customerNumber, customerassociatedregistryId)}/${
          associatedRegistrySite.id
        }`,
        associatedRegistrySite.serialize(customerNumber, customerassociatedregistryId)
      );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAssociatedRegistrySite) => AssociatedRegistrySiteModel.deserialize(response)),
      tapWithAction((associatedOffice: AssociatedRegistrySiteModel) => {
        this.associatedRegistrySites = Utilities.updateArray<AssociatedRegistrySiteModel>(
          this.associatedRegistrySites,
          associatedOffice,
          {
            replace: !isAddAssociatedRegistrySite,
            predicate: t => t.id === associatedOffice.id,
          }
        );
        return AlertStore.info(
          `Associated Registry Site ${isAddAssociatedRegistrySite ? 'created' : 'updated'} successfully!`
        );
      })
    );
  }

  /* istanbul ignore next */
  public getImportedDecalsData(request?: IAPIGridRequest): Observable<IAPIPageResponse<ImportCustomsDecalModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIImportCustomsDecal>>(`${apiUrls.customsDecal}/import?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: ImportCustomsDecalModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public importCustomsDecal(file: File, year: string): Observable<File> {
    const data: FormData = new FormData();
    data.append('File', file);
    data.append('Year', year);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http.post(`${apiUrls.customsDecal}/import`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: ImportCustomsDecalModel.deserializeList(response.results) })),
      tap(resp => {
        resp.validationMessage
          ? AlertStore.critical(resp.validationMessage)
          : AlertStore.info('File Imported Successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public downloadDecalTemplate(): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.customer,
      responseType: 'blob',
    });
    return http.get(`${apiUrls.customsDecal}/template`).pipe(Logger.observableCatchError);
  }

  /* istanbul ignore next */
  public downloadDecalLogFile(fileId: number): Observable<File> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.customer,
      responseType: 'blob',
    });
    return http.get(`${apiUrls.customsDecal}/log-file/${fileId}`).pipe(Logger.observableCatchError);
  }

  public getCustomerProfile(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerProfileModel[]>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.CUSTOMER_PROFILE,
      sortCollection: JSON.stringify([{ propertyName: 'Status.Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICustomerProfile[]>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CustomerProfileModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertCustomerProfile(
    customerProfile: CustomerProfileModel
    // partyId: number
  ): Observable<CustomerProfileModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddCustomerProfile: boolean = customerProfile.id === 0;
    const upsertRequest: Observable<IAPICustomerProfile> = isAddCustomerProfile
      ? http.post<IAPICustomerProfile>(apiUrls.customerProfile, customerProfile.serialize())
      : http.put<IAPICustomerProfile>(`${apiUrls.customerProfile}/${customerProfile.id}`, customerProfile.serialize());
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPICustomerProfile) => CustomerProfileModel.deserialize(response)),
      tapWithAction(() =>
        AlertStore.info(`Customer Profile ${isAddCustomerProfile ? 'created' : 'updated'} successfully!`)
      )
    );
  }
}
