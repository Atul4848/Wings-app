import { PreferencesModel } from '../../Shared/Models/Preferences.model';
import { IAPICustomerResponse } from './API-customer-response.interface';
import { IAPIUserProfileRoleResponse } from './API-userprofile-role-response.interface';

export interface IAPIUserResponse {
    Id: string;
    UserId: string;
    OktaUserId: string;
    CSDUsername: string;
    ActiveCustomerId: string;
    ActiveCustomerSite: string;
    CSDUserId: number;
    FirstName: string;
    LastName: string;
    Username: string;
    Email: string;
    OracleFNDUsername: string;
    OracleFNDUserId: number;
    LastLogin: string;
    Status: string;
    Provider: string;
    IsEmailVerified: boolean;
    JobRole: string;
    AssumeIdentity?: number;
    EndDate: string;
    Roles?: IAPIUserProfileRoleResponse[];
    Preferences: PreferencesModel[];
    Customers?: IAPICustomerResponse[];
  }
  