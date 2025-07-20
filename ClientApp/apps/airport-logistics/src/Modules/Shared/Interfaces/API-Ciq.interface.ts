import { IAPISurvey, IAPICiqCrewPax } from './index';

export interface IAPICiq {
  AirportHandlerId: number;
  AirportId: number;
  AirportLogisticsStageId: number;
  CIQCrewPax: IAPICiqCrewPax;
  ReviewStatus: string;
  SurveyInfo: IAPISurvey;
}
