import { IAPIRetailDataOptionsResponse } from './IAPIRetailDataOptionsResponse';

export class IAPIRetailDataResponse {
    Id: string;
    Status: string;
    StartDate: string;
    Username: string;
    EndDate: string;
    Option: IAPIRetailDataOptionsResponse;
}