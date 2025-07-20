import { IAPIEvent, IAPIEventsHandlerInfo, IAPISurvey } from './index';

export interface IAPIAirportEvents {
  AirportHandlerId: number;
  AirportId: number;
  PertinentInfo: string;
  StageEvents: IAPIEvent[];
  ApprovedEvents: IAPIEvent[];
  StageHandlerInfo: IAPIEventsHandlerInfo;
  ApprovedHandlerInfo: IAPIEventsHandlerInfo;
  ReviewStatus: string;
  SurveyInfo: IAPISurvey;
}
