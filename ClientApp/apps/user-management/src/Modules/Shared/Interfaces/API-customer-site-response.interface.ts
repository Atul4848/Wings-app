import { IAPIServicesResponse } from './API-services-response.interface';

export interface IAPICustomerSiteResponse {
    Number: string;
    ClientId: string;
    Services?: IAPIServicesResponse[];
}