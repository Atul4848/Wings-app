import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIFAAImportProcess extends IBaseApiResponse {
  blobName: string;
  processId: string;
  faaImportStatus: IAPIFAAImportStatus;
  faaMergeAllStatus: IAPIFAAMergeAllStatus;
  processDate: string;
}

interface IAPIFAAImportStatus extends IBaseApiResponse {
  faaImportStatusId: number;
}

interface IAPIFAAMergeAllStatus extends IBaseApiResponse {
  faaImportMergeAllStatusId: number;
}
