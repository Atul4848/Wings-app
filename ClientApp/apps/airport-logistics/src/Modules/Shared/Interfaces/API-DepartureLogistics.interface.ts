import { IAPIDepartureLogisticsData } from './../Interfaces/index';
import { IAPISurvey } from './API-survey';

export interface IAPIDepartureLogistics {
  AirportHandlerId: number;
  AirportId: number;
  SurveyInfo: IAPISurvey;
  DepartureLogistics: IAPIDepartureLogisticsData;
  ReviewStatus: string;
}
