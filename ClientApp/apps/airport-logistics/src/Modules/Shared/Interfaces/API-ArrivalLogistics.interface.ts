import { IAPISurvey } from './API-survey';
import {
  IAPIArrivalLogisticsStageApproved,
} from './API-ArrivalLogisticsStageApproved.interface';

export interface IAPIArrivalLogistics {
  AirportHandlerId: number;
  AirportId: number;
  ApprovedData: IAPIArrivalLogisticsStageApproved;
  StageData: IAPIArrivalLogisticsStageApproved;
  ReviewStatus: string;
  SurveyInfo: IAPISurvey;
}
