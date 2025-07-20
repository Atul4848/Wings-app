import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIFARType extends IBaseApiResponse {
  cappsCode: string;
  flightOperationalCategory?: IAPIFlightOperationalCategory;
  flightOperationalCategoryId?: number;
  purposeOfFlights?: IAPIPurposeOfFlight[];
  farTypePurposeOfFlights?: IAPIPurposeOfFlight[];
}

export interface IAPIFlightOperationalCategory extends IBaseApiResponse {
  flightOperationalCategoryId: number;
}

interface IAPIPurposeOfFlight {
  farTypeId?: number;
  purposeOfFlightId?: number;
}
