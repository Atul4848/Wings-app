import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIPermitRequiredElement extends IBaseApiResponse {
  permitRequiredElementId: number;
  element: IAPIElement;
}

export interface IAPIElement extends IBaseApiResponse {
  elementId: number;
}

export interface IAPIElementRequest {
  permitRequiredElements: number[];
}
