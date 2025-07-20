import { IAPISiteResponse } from './API-site-response.interface';

export interface IAPICustomerResponse {
    Id: string;
    CustomerNumber: string;
    Name: string;
    Status: string;
    EndDate: string;
    CustomerId: string;
    Sites?: IAPISiteResponse[];
  }
  