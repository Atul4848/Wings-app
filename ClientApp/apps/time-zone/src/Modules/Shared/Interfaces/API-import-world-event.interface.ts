import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIImportWorldEvent extends IBaseApiResponse {
  processDate: string;
  worldEventImportStatus: number;
  blobName: string;
  runId: string;
  totalCount: number;
  errorCount: number;
}
