import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICustomerProfile extends IBaseApiResponse {
  customerProfileId?:number;
  customerProfileLevelId?: number;
  customerName: string;
  customerNumber: string;
  partyId: number;
  profileTopicId?: number;
  startDate: string;
  endDate: string;
  text: string;
  isUFN: boolean;
  entities: IAPICustomerProfileEntityRequest[];

  //response fields
  profileTopic?: IAPICustomerProfileTopic;
  customerProfileLevel?: IAPICustomerProfileLevel;
}

export interface IAPICustomerProfileLevel extends IBaseApiResponse {
  customerProfileLevelId: number;
}

export interface IAPICustomerProfileTopic extends IBaseApiResponse {
  profileTopicId: number;
}
export interface IAPICustomerProfileEntityRequest extends IBaseApiResponse {
  entityId: number;
  entityCode: string;
  entityName: string;
}
