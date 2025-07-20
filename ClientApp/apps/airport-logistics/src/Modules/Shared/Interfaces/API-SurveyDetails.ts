import { IAPIAircraftLogisticsParking } from './index';
import { IAPISurvey } from './API-survey';

export interface  IAPISurveyDetails {
  AircraftGroundLogisticsAndParking: IAPIAircraftLogisticsParking;
  AirportHandlerId: number;
  AirportId: number;
  SurveyInfo: IAPISurvey;
  ReviewStatus: string;
}
