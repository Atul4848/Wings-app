import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAerodromeRefCode extends IBaseApiResponse {
  code: string;
  fieldLength: String;
  wingSpan: string;
  outerWheelSpan: string;
  description: string;
}
