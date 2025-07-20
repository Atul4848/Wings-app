import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirframe extends IBaseApiResponse {
  serialNumber: string;
  airframeWeightAndLength: IAPIAirframeWeightAndLength;
  aircraftVariation: IAPIAircraftVariation;
}

interface IAPIAirframeWeightAndLength {
  maxTakeOffWeight?: number;
}

interface IAPIAircraftVariation {
  cappsId?: number;
}
