import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIWorldEventReview extends IBaseApiResponse {
  cappsSequenceId?: number;
  worldEventType?: IAPIWorldEventType;
  worldEventCategory?:IAPIWorldEventCategoryType;
  mergeStatus?: number;
  comparisionType?: number;
  refDataId?:number;
  uplinkStagingProperties?: IAPIUplinkWorldEventsReview[];
}

interface IAPIWorldEventType extends IBaseApiResponse {
  worldEventTypeId: number;
}

interface IAPIWorldEventCategoryType extends IBaseApiResponse {
  worldEventCategoryId: number;
}

export interface IAPIUplinkWorldEventsReview {
  id: number;
  worldEventStagingId: number;
  tableName: string;
  propertyName: string;
  oldValue?: string;
  newValueId?: number | null;
  newValueCode?: string;
  newValue?: string;
  mergeStatus: number;
  isList?: boolean;
}

interface Error {
  propertyName: string;
  propertyValue: string;
  errorMessage: string;
}

export interface IAPIFaaMergeResponse extends IBaseApiResponse {
  hasErrors: boolean;
  errors: Error[];
}
