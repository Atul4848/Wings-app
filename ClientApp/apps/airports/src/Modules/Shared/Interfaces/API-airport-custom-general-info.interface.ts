import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportCustomGeneral extends IBaseApiResponse {
  customsGeneralInformationId: number;
  airportId: number;
  customsAvailableAtAirport: boolean;
  clearanceLocationSpecifics: string;
  gaClearanceAvailable: boolean;
  maximumPersonsOnBoardAllowedForGAClearance: number;
  customsOfficerDispatchedFromAirportId: number;
  customOfficerDispatchedFromAirport: IAPICustomOfficerDispacthedFromAirport;
  appliedCustomsLocationInformations: IAPIAppliedCustomsLocationInformation[];
  customsClearanceFBOs: IAPICustomsClearanceFBO[];
  appliedMaxPOBAltClearanceOptions: IAPIAppliedMaxPOBAltClearanceOption[];
  maximumPersonsOnBoardAllowedForGAClearanceNotes:string
}
export interface IAPICustomOfficerDispacthedFromAirport {
  airportId: number;
  displayCode: string;
  airportName: string;
}
export interface IAPICustomsLocationInformation {
  customsLocationInformationId: number;
  name: string;
}
export interface IAPIAppliedCustomsLocationInformation {
  id: number;
  appliedCustomsLocationInformationId: number;
  customsGeneralInformationId: number;
  customsLocationInformation: IAPICustomsLocationInformation;
}

export interface IAPICustomsClearanceFBO {
  id: number;
  customsClearanceFBOId: number;
  clearanceFBOId: number;
  clearanceFBOName: string;
  clearanceFBOCode: string;
}

export interface IAPIMaxPOBAltClearanceOption {
  maxPOBAltClearanceOptionId: number;
  name: string;
}
export interface IAPIAppliedMaxPOBAltClearanceOption {
  id: number;
  appliedMaxPOBAltClearanceOptionId: number;
  customsGeneralInformationId: number;
  maxPOBAltClearanceOption: IAPIMaxPOBAltClearanceOption;
}

//REQUEST
export interface IAPIAirportCustomGeneralRequest extends IBaseApiResponse {
  airportId?: number;
  customsAvailableAtAirport: boolean;
  customsOfficerDispatchedFromAirportId: number;
  clearanceLocationSpecifics: string;
  gaClearanceAvailable: boolean;
  maximumPersonsOnBoardAllowedForGAClearance: number;
  appliedCustomsLocationInformations: IAPIAppliedCustomsLocationInformationsRequest[];
  customsClearanceFBOs: IAPIcustomsClearanceFBOsRequest[];
  appliedMaxPOBAltClearanceOptions: IAPIAppliedMaxPOBAltClearanceOptionsRequest[];
  maximumPersonsOnBoardAllowedForGAClearanceNotes:string
}
export interface IAPIAppliedCustomsLocationInformationsRequest {
  id: number;
  customsLocationInformationId: number;
}
export interface IAPIAppliedMaxPOBAltClearanceOptionsRequest {
  id: number;
  maxPOBAltClearanceOptionId: number;
}
export interface IAPIcustomsClearanceFBOsRequest {
  id: number;
  clearanceFBOId: number;
  clearanceFBOName: string;
  clearanceFBOCode: string;
}
