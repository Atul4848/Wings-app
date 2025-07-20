import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAirportAddress } from './API-airport-address.interface';

export interface IAPIAirportManagement extends IBaseApiResponse {
  airportManagementId?: number;
  airportId?: number;
  airportManagerName: string;
  airportManagerAddress: IAPIAirportAddress;
  airportOwnerName: string;
  airportOwnerAddress: IAPIAirportAddress;
}
