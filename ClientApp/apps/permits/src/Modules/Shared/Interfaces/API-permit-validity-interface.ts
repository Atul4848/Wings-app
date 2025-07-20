import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIPermitValidity extends IBaseApiResponse {
  permitId: number;
  toleranceMinus: string;
  tolerancePlus: string;
  flightOperationalCategory: IFlightOperationalCategory;
  presetValidity: IPresetValidity;
}

interface IFlightOperationalCategory extends IBaseApiResponse {
  flightOperationalCategoryId: number;
}

interface IPresetValidity extends IBaseApiResponse {
  presetValidityId: number;
}

export interface IAPIPermitValidityRequest extends IBaseApiResponse {
  presetValidityId: number;
  flightOperationalCategoryId: number;
  permitId: number;
  toleranceMinus: string;
  tolerancePlus: string;
}
