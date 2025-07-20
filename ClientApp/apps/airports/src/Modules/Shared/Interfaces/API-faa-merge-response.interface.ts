import { IBaseApiResponse } from '@wings-shared/core';

interface Error {
  propertyName: string;
  propertyValue: string;
  errorMessage: string;
}

export interface IAPIFaaMergeResponse extends IBaseApiResponse {
  hasErrors: boolean;
  errors: Error[];
}
