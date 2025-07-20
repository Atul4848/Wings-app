import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICustomerRef, IAPIUserRef } from '@wings/shared';

export interface IAPIAssociatedSpecialCare extends IAssociatedSpecialCareRequest {
  associatedSpecialCareId?: number;
  specialCareType: IAPISpecialCareType;
  person: IAPIUserRef;
  specialCareTypeLevel: IAPISpecialCareTypeLevel;
  specialCareTypeEntity: IAPISpecialCareEntity;
  customer: IAPICustomerRef;
}

export interface IAssociatedSpecialCareRequest extends IBaseApiResponse {
  customerName: string;
  customerNumber: string;
  customerStartDate?: string;
  customerEndDate?: string;
  associatedSpecialCareId?: number;
  specialCareTypeId: number;
  partyId: number;
  personId: number;
  personGuid: string;
  personFirstName: string;
  personLastName: string;
  personEmail: string;
  specialCareTypeLevelId: number;
  specialCareTypeEntityId: number;
  specialCareTypeEntityName: string;
  specialCareTypeEntityCode: string;
}

interface IAPISpecialCareType extends IBaseApiResponse {
  specialCareTypeId: number;
}

interface IAPISpecialCareTypeLevel extends IBaseApiResponse {
  specialCareTypeLevelId: number;
}

interface IAPISpecialCareEntity extends IBaseApiResponse {
  specialCareTypeEntityId: number;
}
