import { Observable, of } from 'rxjs';
import { CustomerModel } from '../Models';
import { CustomersStore } from '../Stores';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class CustomersStoreMock extends CustomersStore {
  public getCustomers(request?: IAPIGridRequest): Observable<IAPIPageResponse<CustomerModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 1,
      results: [ new CustomerModel(), new CustomerModel() ],
    })
  }

  public deleteCustomer(id: string): Observable<boolean> {
    return of(true);
  }

  public upsertCustomer(customer: CustomerModel): Observable<boolean> {
    return of(true);
  }

}