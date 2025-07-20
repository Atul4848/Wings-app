import { CustomerStore } from '../Stores';
import { Observable, of } from 'rxjs';
import {
  AssociatedOfficeModel,
  AssociatedRegistriesModel,
  AssociatedRegistrySiteModel,
  AssociatedSpecialCareModel,
  CustomerContactModel,
  CustomerModel,
  RegistryModel,
} from '../Models';
import { NO_SQL_COLLECTIONS } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse, StatusTypeModel } from '@wings-shared/core';
import { observable } from 'mobx';

export class CustomerStoreMock extends CustomerStore {
  @observable selectedCustomer = new CustomerModel({
    ...this.selectedCustomer,
    associatedRegistries: [
      new AssociatedRegistriesModel({
        id: 1,
        registry: new RegistryModel({ id: 2, name: 'Test' }),
        status: new StatusTypeModel({ id: 1, name: 'Active' }),
      }),
    ],
  });

  public getCustomersNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerModel>> {
    return of({
      collectionName: NO_SQL_COLLECTIONS.CUSTOMER,
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new CustomerModel(), new CustomerModel() ],
    });
  }

  public upsertCustomer(customer: CustomerModel): Observable<CustomerModel> {
    return of(new CustomerModel());
  }

  public getCustomerById(customerId: number): Observable<CustomerModel> {
    return of(new CustomerModel());
  }

  public getCustomerNoSqlById(request: IAPIGridRequest): Observable<CustomerModel> {
    return of(new CustomerModel());
  }

  public upsertAssociatedOffice(
    associatedOffice: AssociatedOfficeModel,
    partyId: number
  ): Observable<AssociatedOfficeModel> {
    return of(new AssociatedOfficeModel());
  }

  public getAssociatedOffice(customerNumber: string, request?: IAPIGridRequest): Observable<AssociatedOfficeModel[]> {
    return of([ new AssociatedOfficeModel(), new AssociatedOfficeModel() ]);
  }

  public upsertAssociatedSpecialCare(
    associatedOffice: AssociatedSpecialCareModel,
    partyId: number
  ): Observable<AssociatedSpecialCareModel> {
    return of(new AssociatedSpecialCareModel());
  }

  public upsertAssociatedRegistrySite(
    associatedRegistrySite: AssociatedRegistrySiteModel,
    customerNumber: string,
    customerassociatedregistryId: number
  ): Observable<AssociatedRegistrySiteModel> {
    return of(new AssociatedRegistrySiteModel());
  }

  public getContacts(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerContactModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new CustomerContactModel(), new CustomerContactModel() ],
    });
  }

  public getContactsNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerContactModel>> {
    return of({
      collectionName: NO_SQL_COLLECTIONS.CONTACT,
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new CustomerContactModel(), new CustomerContactModel() ],
    });
  }
}
