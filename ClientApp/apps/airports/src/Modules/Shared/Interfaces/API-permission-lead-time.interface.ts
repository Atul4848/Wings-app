import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIPermissionLeadTime extends IBaseApiResponse {
  permissionId: number;
  leadTime: number;
  leadTimeUOMId: number;
  leadTimeTypeId: number;
  permissionLeadTimeId?: number;
  leadTimeType?: IAPILeadTimeType;
  leadTimeUOM?: IAPILeadTimeUOM;
}

interface IAPILeadTimeType extends IBaseApiResponse {
  permissionLeadTimeTypeId: number;
}

interface IAPILeadTimeUOM extends IBaseApiResponse {
  leadTimeUOMId: number;
  timeLevelUOMId: number;
}
