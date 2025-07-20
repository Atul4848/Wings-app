import { IAPICountry, IAPIRegion, IAPIState, IAPICity } from '@wings/shared';
import { IAPIUAOffices } from '../Interfaces';
import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIEventSchedule } from '@wings-shared/scheduler';

export interface IAPIEvent extends IBaseApiResponse {
  worldEventId?: number;
  description: string;
  url: string;
  notes: string;
  isMajorEvent: boolean;
  beginPlanning: number;
  worldEventTypeId: number;
  worldEventCategoryId: number;
  // view models
  eventSchedule: IAPIEventSchedule;
  worldEventType?: IAPIWorldEventType;
  worldEventCategory?: IAPIWorldEventCategory;
  worldEventUAOffices?: IAPIWorldEventUAOffices[];
  countries: Partial<IAPICountry>[];
  worldEventAirports: IAPIWorldEventAirports[];
  cities: Partial<IAPICity>[];
  states: Partial<IAPIState>[];
  regions: Partial<IAPIRegion>[];
  appliedWorldEventSpecialConsiderations: IAPISpecialConsiderationRequest[];
}

export interface IAPIWorldEventAirports extends IBaseApiResponse {
  airportId: number;
  icaoCode: string;
  uwaCode: string;
  airportName: string;
}

export interface IAPIWorldEventUAOffices extends IBaseApiResponse {
  uaOfficeId: number;
  uaOffice?: IAPIUAOffices;
}

interface IAPISpecialConsiderationRequest extends IAPISpecialConsideration {
  worldEventSpecialConsideration?: IAPISpecialConsideration;
}

interface IAPISpecialConsideration extends IBaseApiResponse {
  worldEventSpecialConsiderationId: number;
}

interface IAPIWorldEventType extends IBaseApiResponse {
  worldEventTypeId: number;
}

interface IAPIWorldEventCategory extends IBaseApiResponse {
  worldEventCategoryId: number;
}
