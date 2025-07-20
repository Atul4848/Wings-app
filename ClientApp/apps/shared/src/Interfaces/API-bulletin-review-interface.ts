import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIBulletinReview extends IBaseApiResponse {
  bulletinEntity?: IAPIBulletinEntity;
  bulletinEntityId: number;
  bulletinEntityName: string;
  bulletinEntityCode: string;
  bulletinLevel?: IAPIBulletinLevel;
  mergeStatus?: number;
  comparisonType?: number;
  bulletinStagingId?: number;
  uplinkBulletinStagings: IAPIUplinkStagingProps[];
}

interface IAPIBulletinEntity extends IBaseApiResponse {
  bulletinEntityId: number;
  bulletinEntityName: string;
  bulletinEntityCode: string;
}

interface IAPIBulletinLevel extends IBaseApiResponse {
  bulletinLevelId: number;
}

export interface IAPIUplinkStagingProps extends IBaseApiResponse {
  uplinkBulletinStagingId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}
