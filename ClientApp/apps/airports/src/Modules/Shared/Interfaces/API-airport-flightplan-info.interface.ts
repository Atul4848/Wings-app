import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportFlightPlanInfoResponse extends IBaseApiResponse {
  airportFlightPlanInfoId?: number;
  airportId?: number;
  navBlueCode: string;
  apgCode: string;
  fplzzzzItem18: string;
  fplzzzz: boolean;
  isVFRAirport: boolean;
  isACDMAirport: boolean;
  isEuroControlFPLACDMAirport: boolean;
  isCompositeFlightPlanRequired: boolean;
  appliedDestAltTOFs: IAPIDestinationAlternateResponse[];
  fpAirspaceId: number;
  fpAirspaceCode: string;
  fpAirspaceName: string;
}
export interface IAPIAirportFlightPlanInfoRequest extends IBaseApiResponse {
  airportFlightPlanInfoId?: number;
  airportId?: number;
  navBlueCode: string;
  apgCode: string;
  fplzzzzItem18: string;
  fplzzzz: boolean;
  isVFRAirport: boolean;
  isACDMAirport: boolean;
  isEuroControlFPLACDMAirport: boolean;
  isCompositeFlightPlanRequired: boolean;
  appliedDestAltTOFs: IAPIDestinationAlternateRequest[];
  fpAirspaceId: number;
  fpAirspaceCode: string;
  fpAirspaceName: string;
}
export interface IAPIDestinationAlternateResponse extends IBaseApiResponse {
  destAltTOF?: IAPIDestinationAlternateTOF;
}
export interface IAPIDestinationAlternateRequest extends IBaseApiResponse {
  destAltTOFId:number;
}
export interface IAPIDestinationAlternateTOF extends IBaseApiResponse {
  destAltTOFId: number;
  code: string;
  name: string;
}
