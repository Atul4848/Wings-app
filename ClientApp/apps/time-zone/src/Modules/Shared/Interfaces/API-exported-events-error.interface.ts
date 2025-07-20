import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIExportedEventsError extends IBaseApiResponse {
  runId: string;
  worldEventImportId: number;
  rowNumber: number;
  message: string;
}
