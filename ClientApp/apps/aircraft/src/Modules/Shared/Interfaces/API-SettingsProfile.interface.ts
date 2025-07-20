import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPISettingsProfile extends IBaseApiResponse {
  profile: string;
  description: string;
}

export interface IAPICruiseSchedule extends IAPISettingsProfile{
  navBlueSchedule: string;
  uvGoSchedule: string;
  foreFlightSchedule: string;
  collinsSchedule: string;
}
