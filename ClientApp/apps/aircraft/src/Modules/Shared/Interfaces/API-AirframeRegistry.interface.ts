import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirframeRegistry extends IBaseApiResponse {
  airframeId: number;
  airframeRegistryId?: number;
  registryId: number;
  registryName: string;
  registrationNationalityId: number;
  registrationNationalityName: string;
  registrationNationalityCode: string;
  carrierCode: string;
  isOutOffOnIn: boolean;
  callSign: string;
  isFlightAwareTracking: boolean;
  startDate: string;
  endDate: string;
  registry?: IAPIRegistry;
}

interface IAPIRegistry extends IBaseApiResponse {
  registryId: number;
}
