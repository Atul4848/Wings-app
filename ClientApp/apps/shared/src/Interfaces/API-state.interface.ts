import { IAPIStateType } from './API-stateType.interface';
import { IAPICountry } from './API-country.interface';
import { IBaseApiResponse, MODEL_STATUS } from '@wings-shared/core';

export interface IAPIState extends IBaseApiResponse {
  countryId: number;
  mapRegion: string;
  stateName: string;
  officialName: string;
  commonName: string;
  isoCode: string;
  statusChangeReason: string;
  statusId: MODEL_STATUS;
  stateTypeId: number;
  stateTypeName: string;
  cappsName: string;
  stateId: number;
  code: string;
  country: IAPICountry;
  stateType: IAPIStateType;
  cappsCode: string;
  startDate: string;
  endDate: string;
  syncToCAPPS: boolean;
  cappsStateCode: string;
  cappsStateName: string;
  isoStateName: string;
  isoStateCode: string;
  stateCode: string;
}

export interface IAPIStateRequest extends IBaseApiResponse {
  officialName: string;
  commonName: string;
  countryId: number;
  isoCode: string;
  stateTypeId: number;
  cappsName: string;
  cappsCode: string;
  code: string;
  statusChangeReason: string;
  syncToCAPPS: boolean;
  startDate: string;
  endDate: string;
}
