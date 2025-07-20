import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIScheduleRestrictions extends IAPIScheduleLevelType {
  scheduleRestrictionId?: number;
  startDate: string;
  endDate: string;
  validatedDate: string;
  validatedBy: string;
  validationNotes: string;
  isAllDeparture: boolean;
  isAllArrival: boolean;
  isAllOverFlight: boolean;
  restrictionType?: IAPIScheduleLevelType;
  restrictingEntities: IAPIScheduleRestrictionsEntity[];
  scheduleDepartureLevel?: IAPIScheduleLevelType;
  scheduleDepartureLevelEntities: IAPIScheduleRestrictionsEntity[];
  scheduleArrivalLevel?: IAPIScheduleLevelType;
  scheduleArrivalLevelEntities: IAPIScheduleRestrictionsEntity[];
  scheduleOverFlightLevel?: IAPIScheduleLevelType;
  scheduleOverFlightLevelEntities: IAPIScheduleRestrictionsEntity[];
  scheduleDepartureLevelEntityExceptions?: IAPIScheduleRestrictionsEntity[];
  scheduleArrivalLevelEntityExceptions?: IAPIScheduleRestrictionsEntity[];
  scheduleOverFlightLevelEntityExceptions?: IAPIScheduleRestrictionsEntity[];
  farTypes?: IAPIScheduleRestrictionsEntity[];
}

export interface IAPIScheduleRestrictionsEntity {
  id: number;
  entityId: number;
  code: string;
  scheduleRestrictionId: number;
  name: string;
  // Base entities ID's for NoSql Entities
  restrictingEntityId?: number;
  scheduleArrivalLevelEntityId?: number;
  scheduleDepartureLevelEntityId?: number;
  scheduleOverFlightLevelEntityId?: number;
  scheduleDepartureLevelEntityExceptionId?: number;
  scheduleArrivalLevelEntityExceptionId?: number;
  scheduleOverFlightLevelEntityExceptionId?: number;
  farTypeId?: number;
}

// Base entities ID's for Level Types
interface IAPIScheduleLevelType extends IBaseApiResponse {
  restrictionTypeId: number;
  scheduleArrivalLevelId: number;
  scheduleDepartureLevelId: number;
  scheduleOverFlightLevelId: number;
}
