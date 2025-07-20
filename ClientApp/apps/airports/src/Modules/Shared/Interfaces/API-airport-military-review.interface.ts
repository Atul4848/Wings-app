import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIMilitaryUplinkStaging extends IBaseApiResponse {
  airport: IAPIAirport;
  mergeStatus?: number;
  comparisionType?: number;
  vendorLocationId?: number;
  airportMilitaryUplinkStagingProperties?: IAPIMilitaryUplinkStagingProperty[];
}

interface IAPIAirport extends IBaseApiResponse {
  airportId: number;
  code: string;
}

export interface IAPIMilitaryUplinkStagingProperty {
  id: number;
  airportMilitaryStagingPropertyId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}

export interface IAPIMilitaryReviewDetail {
  appliedAirportType: IAPIAirportType;
}

interface IAPIAirportType {
  oldValue: IAirportType[];
  newValue: IAirportType[];
}

interface IAirportType {
  id: number;
  airportTypeId: number;
  name: string;
}

interface Error {
  propertyName: string;
  propertyValue: string;
  errorMessage: string;
}

export interface IAPIUplinkResponse extends IBaseApiResponse {
  hasErrors: boolean;
  errors: Error[];
}
