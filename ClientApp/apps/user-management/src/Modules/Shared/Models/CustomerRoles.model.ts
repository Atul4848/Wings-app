import { IdNameModel, ISelectOption, modelProtection, Utilities } from '@wings-shared/core';
import { IAPICustomerRoleResponse } from '../Interfaces';

@modelProtection
export class CustomerRolesModel extends IdNameModel {
    permissions: string[] = [];

    constructor(data?: Partial<CustomerRolesModel>) {
      super();
      Object.assign(this, data);
    }

    static deserialize(role: IAPICustomerRoleResponse): CustomerRolesModel {
      if (!role) {
        return new CustomerRolesModel();
      }
      const data: Partial<CustomerRolesModel> = {
        id: Utilities.getTempId(true),
        name: role.Name,
        permissions: role.Permissions,
      };

      return new CustomerRolesModel(data);
    }

    public serialize(): IAPICustomerRoleResponse { 
      return {
        Name: this.name,
        Permissions: this.permissions,
      };
    }

    static deserializeList(roles: IAPICustomerRoleResponse[]): CustomerRolesModel[] {
      return roles
        ? roles.map((role: IAPICustomerRoleResponse) => CustomerRolesModel.deserialize(role))
        : [];
    }
}