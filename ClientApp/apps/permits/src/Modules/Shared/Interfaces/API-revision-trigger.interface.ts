import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIRevisionTrigger extends IBaseApiResponse {
  permitAdditionalInfoRevisionId?: number;
  permitAdditionalInfoId: number;
  process: string;
  missionElement?: IMissionElement;
  missionElementId: number;
  appliedPermitDataElements?: IAppliedPermitDataElement[];
  dataElementIds: number[];
}

interface IMissionElement extends IBaseApiResponse {
  missionElementId: number;
}

interface IAppliedPermitDataElement extends IBaseApiResponse {
  appliedPermitDataElementId: number;
  dataElement: IDataElement;
}

interface IDataElement extends IBaseApiResponse {
  dataElementId: number;
}
