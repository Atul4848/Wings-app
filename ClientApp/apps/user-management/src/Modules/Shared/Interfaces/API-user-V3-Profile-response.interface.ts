import { IAPICustomerResponse } from './API-customer-response.interface';
import { IAPIUserSession } from './API-user-sessions';

export interface IAPIUserV3ProfileResponse {
  ActiveCustomerId: string;
  ActiveCustomerSite: string;
  CSDUserId?: number;
  CSDUsername:string;
  OracleFNDUsername: string;
  OracleFNDUserId?: number;
  JobRole: string;
  AssumeIdentity?: number;
  Customers?: IAPICustomerResponse[];
  LastLogin: string;
  Session: IAPIUserSession[]
}
