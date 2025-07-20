import { IAPICSDProductsServicesResponse } from './API-csd-products-services-response.interface';

export interface IAPIUserRoleResponse {
    Name: string;
    ServiceName: string;
    Level: string;
    Permissions: string[];
    CSDDetails?: IAPICSDProductsServicesResponse;
}