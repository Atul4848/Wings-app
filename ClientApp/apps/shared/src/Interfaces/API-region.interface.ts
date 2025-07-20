import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry } from './API-country.interface';

export interface IAPIRegion extends IBaseApiResponse {
  code: string;
  regionTypeId?: number;
  regionTypeName: string;
  regionType: IAPIRegionRequest;
  countries: IAPICountry[];
  regionId: number;
  regionName: string;
}

export interface IAPIRegionRequest extends IBaseApiResponse {
  code: string;
  regionTypeId: number;
}
