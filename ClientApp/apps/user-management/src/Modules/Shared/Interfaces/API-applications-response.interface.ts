import { IAPIRoleResponse } from './API-role-response.interface';

export interface IAPIApplicationsResponse {
    Id: string;
    Name: string;
    OktaClientIds: string[];
  }