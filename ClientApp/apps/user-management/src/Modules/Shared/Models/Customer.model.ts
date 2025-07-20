import { IAPICustomerResponse } from '../Interfaces';
import { SiteModel } from './Sites.model';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class CustomerModel extends IdNameModel<string> {
  number: string = '';
  status: string = '';
  endDate: string = '';
  customerId: string = '';
  sites: SiteModel[] = [];
  
  constructor(data?: Partial<CustomerModel>) {
    super();
    Object.assign(this, data);
    this.sites = data?.sites?.map(x => new SiteModel(x)) || [];
  }


  static deserialize(customer: IAPICustomerResponse): CustomerModel {
    if (!customer) {
      return new CustomerModel();
    }
    const data: Partial<CustomerModel> = {
      id: customer.Id,
      name: customer.Name,
      number: customer.CustomerNumber,
      customerId: customer.CustomerId,
      status: customer.Status,
      endDate: customer.EndDate,
      sites: SiteModel.deserializeList(customer.Sites),
    };

    return new CustomerModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPICustomerResponse {
    return {
      Id: this.id,
      CustomerNumber: this.number,
      Name: this.name,
      Status: this.status,
      CustomerId: this.customerId,
      EndDate: this.endDate,
      Sites: this.sites?.map((sites: SiteModel) => sites.serialize()) || [],
    };
  }

  static deserializeList(customers: IAPICustomerResponse[]): CustomerModel[] {   
    return customers ? customers.map((customer: IAPICustomerResponse) => CustomerModel.deserialize(customer)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
