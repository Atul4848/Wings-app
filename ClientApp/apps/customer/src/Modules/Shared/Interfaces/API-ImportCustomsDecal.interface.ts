import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIImportCustomsDecal extends IBaseApiResponse {
  processDate: string;
  customsDecalImportFileStatus: IFileImportStatus;
  blobName: string;
  processId: string;
  logFileName?: string;
  validationMessage: string;
}

interface IFileImportStatus {
  id: number;
  customsDecalImportFileStatusId: number;
  name: string;
}
