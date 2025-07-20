import { IAPIRoleResponse } from './API-role-response.interface';

export interface IAPIServicesResponse {
    Id: string;
    Name: string;
    DisplayName: string;
    Description: string;
    ApplicationName: string;
    ApplicationId: string;
    Enabled: boolean;
    Roles?: IAPIRoleResponse[];
  }