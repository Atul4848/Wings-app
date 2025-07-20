import { IAPICustomerRoleResponse } from './API-customer-role-response.interface';

export interface IAPICustomerServicesResponse {
    ServiceId: string;
    Name: string;
    Roles?: IAPICustomerRoleResponse[] | string [];
  }