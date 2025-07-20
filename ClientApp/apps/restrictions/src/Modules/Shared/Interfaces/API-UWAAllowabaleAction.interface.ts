import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIUWAAllowableAction extends IBaseApiResponse {
  isEditable: boolean;
  summaryDescription: string;
}
