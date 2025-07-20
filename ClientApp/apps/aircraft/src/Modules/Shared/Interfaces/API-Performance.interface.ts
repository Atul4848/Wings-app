import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIGenericRegistry } from './API-GenericRegistry.interface';

export interface IAPIPerformance extends IBaseApiResponse {
  isRestricted: boolean;
  performanceId?: number;
  comments: string;
  name: string;
  fomS230: string;
  maxFlightLevel: string;
  mtowInPounds: number;
  mtowInKilos: number;
  isVerificationComplete: boolean;
  performanceLinks: IAPIPerformanceLink[];
  defaultClimbSchedule?: IAPIClimbSchedule;
  defaultHoldSchedule?: IAPIHoldSchedule;
  defaultDescentSchedule?: IAPIDescentSchedules;
  defaultCruiseSchedule?: IAPICruiseSchedule;
}

export interface IAPIPerformanceResponse extends IAPIPerformance {
  climbSchedules: IAPIClimbSchedule[];
  holdSchedules: IAPIHoldSchedule[];
  descentSchedules: IAPIDescentSchedules[];
  cruiseSchedules: IAPICruiseSchedule[];
  wakeTurbulenceCategory: IAPIWakeTurbulenceCategory;
  icaoTypeDesignator: IAPIICAOTypeDesignator;
  navBlueGenericRegistries: IAPIGenericRegistry[];
}

export interface IAPIPerformanceRequest extends IAPIPerformance {
  climbSchedules: number[];
  holdSchedules: number[];
  descentSchedules: number[];
  cruiseSchedules: number[];
  defaultClimbScheduleId: number;
  defaultHoldScheduleId: number;
  defaultDescentScheduleId: number;
  defaultCruiseScheduleId: number;
  icaoTypeDesignatorId: number;
  wakeTurbulenceCategoryId: number;
}

interface IAPIClimbSchedule extends IBaseApiResponse {
  climbScheduleId: number;
  profile: string;
  description: string;
}

interface IAPIHoldSchedule extends IBaseApiResponse {
  holdScheduleId: number;
  profile: string;
  description: string;
}

interface IAPIDescentSchedules extends IBaseApiResponse {
  descentScheduleId: number;
  profile: string;
  description: string;
}

interface IAPICruiseSchedule extends IBaseApiResponse {
  cruiseScheduleId: number;
  profile: string;
  description: string;
  navBlueSchedule: string;
  uvGoSchedule: string;
  foreFlightSchedule: string;
  collinsSchedule: string;
}

interface IAPIICAOTypeDesignator extends IBaseApiResponse {
  icaoTypeDesignatorId?: number;
}

interface IAPIWakeTurbulenceCategory extends IBaseApiResponse {
  wakeTurbulenceCategoryId?: number;
}

export interface IAPIPerformanceLink extends IBaseApiResponse {
  performanceLinkId?: number;
  link: string;
  description: string;
}

export interface IAPIPolicySchedule extends IBaseApiResponse {
  profile: string;
  description: string;
  isDefault?: boolean;
}

export interface IAPICruisePolicySchedule extends IAPIPolicySchedule {
  navBlueSchedule: string;
  uvGoSchedule: string;
  foreFlightSchedule: string;
  collinsSchedule: string;
}