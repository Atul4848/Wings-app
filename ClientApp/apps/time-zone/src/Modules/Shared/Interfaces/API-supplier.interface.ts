import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPISupplier extends IBaseApiResponse {
  supplierId?: number;
  emailAddress: string;
  supplierType: IAPISupplierType;
  serviceLevel: IAPIServiceLevel;
  supplierCountries: IAPICountry[];
  supplierStates: IAPIState[];
  supplierCities: IAPICity[];
  supplierAirports: IAPISupplierAirport[];
}

export interface IAPISupplierRequest extends IBaseApiResponse {
  emailAddress: string;
  supplierTypeId: number;
  serviceLevelId: number;
  supplierCountries: IAPICountry[];
  supplierStates: IAPIState[];
  supplierCities: IAPICity[];
}

interface IAPISupplierType extends IBaseApiResponse {
  supplierTypeId: number;
}

interface IAPIServiceLevel extends IBaseApiResponse {
  serviceLevelId: number;
}

interface IAPICountry extends IBaseApiResponse {
  countryId: number;
  code: string;
}

export interface IAPIState extends IBaseApiResponse {
  stateId?: number;
  code: string;
}

export interface IAPICity extends IBaseApiResponse {
  cityId?: number;
  code: string;
}

export interface IAPISupplierAirport extends IBaseApiResponse {
  supplierAirportId: number;
  tollFreeNumber: string;
  phoneNumber: string;
  faxNumber: string;
  webSite: string;
  airport: IAPIAirport;
  cappsSupplierAirportId:string
}

export interface IAPISupplierAirportRequest extends IBaseApiResponse {
  tollFreeNumber: string;
  phoneNumber: string;
  faxNumber: string;
  webSite: string;
  supplierId:number
  airportId:number
  cappsSupplierAirportId:string
}

interface IAPIAirport {
  airportId: number;
  name?: string;
  airportCode?: string;
  airportName?: string;
  displayCode?: string;
}
