import { CustomerRolesModel } from './CustomerRoles.model';
import { IAPICustomerServicesResponse } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class CustomerServicesModel extends IdNameModel<string> {
  roles: CustomerRolesModel[] = [];
  roleName: string = '';
  rolePermissions: string = '';

  constructor(data?: Partial<CustomerServicesModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(service: IAPICustomerServicesResponse): CustomerServicesModel {
    if (!service) {
      return new CustomerServicesModel();
    }
    const data: Partial<CustomerServicesModel> = {
      id: service.ServiceId,
      name: service.Name,
      roles: CustomerRolesModel.deserializeList(service.Roles),
      roleName: CustomerRolesModel.deserializeList(service.Roles).map(x=>x.name).join(','),
      rolePermissions: CustomerRolesModel.deserializeList(service.Roles).map(x=>x.permissions).join(','),
    };
    return new CustomerServicesModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPICustomerServicesResponse {
    return {
      ServiceId: this.id,
      Name: this.name,
      Roles: this.roles?.map(x => x.name) || [],
    };
  }

  static deserializeList(services: IAPICustomerServicesResponse[]): CustomerServicesModel[] {
    return services
      ? services.map((service: IAPICustomerServicesResponse) => CustomerServicesModel.deserialize(service))
      : [];
  }
}
