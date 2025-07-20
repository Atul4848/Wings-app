import { IdNameModel, Utilities, modelProtection } from '@wings-shared/core';
import { IAPICustomerSiteResponse } from '../Interfaces';
import { CustomerServicesModel } from './CustomerServices.model';

@modelProtection
export class CustomerSitesModel extends IdNameModel {
  number: string = '';
  clientId: string = '';
  services: CustomerServicesModel[] = [];
  servicesName: string = '';
  roleName: string = '';
  rolePermissions: string = '';

  constructor(data?: Partial<CustomerSitesModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(site: IAPICustomerSiteResponse): CustomerSitesModel {
    if (!site) {
      return new CustomerSitesModel();
    }
    const data: Partial<CustomerSitesModel> = {
      id: Utilities.getTempId(true),
      number: site.Number,
      clientId: site.ClientId,
      services: CustomerServicesModel.deserializeList(site.Services),
      servicesName: CustomerServicesModel.deserializeList(site.Services).map(x=>x.name).join(','),
      roleName: CustomerServicesModel.deserializeList(site.Services).map(x=>x.roleName).join(','),
      rolePermissions: CustomerServicesModel.deserializeList(site.Services).map(x=>x.rolePermissions).join(','),
    };

    return new CustomerSitesModel(data);
  }

  public serialize(): IAPICustomerSiteResponse {
    return {
      Number: this.number,
      ClientId: this.clientId,
      Services: this.services?.map((services: CustomerServicesModel) => services.serialize()) || [],
    };
  }

  static deserializeList(sites: IAPICustomerSiteResponse[]): CustomerSitesModel[] {
    return sites
      ? sites.map((site: IAPICustomerSiteResponse) => CustomerSitesModel.deserialize(site))
      : [];
  }
}