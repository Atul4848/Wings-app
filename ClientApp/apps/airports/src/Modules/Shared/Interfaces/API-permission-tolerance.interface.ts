import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIPermissionTolerance extends IBaseApiResponse {
  permissionId: number;
  permissionToleranceId?: number;
  permissionRequiredForIds: number[];
  toleranceMinus: number;
  tolerancePlus: number;
  permissionRequiredFors?: IAPIPermissionRequiredFor[];
}

interface IAPIPermissionRequiredFor extends IBaseApiResponse {
  permissionRequiredForId: number;
}
