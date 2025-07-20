import { CoreModel } from './Core.model';
import { IAPISurvey } from './../Interfaces/index';
import { SURVEY_STATUS } from './../Enums/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class SurveyModel extends CoreModel {
  id: number = null;
  airportName: string = '';
  ICAO: string = '';
  handlerName: string = '';
  submittedDate: string = '';
  reviewStatus: string = '';
  lastUpdatedUser: string = '';
  approvedDate: string = '';

  constructor(data?: Partial<SurveyModel>) {
    super();
    Object.assign(this, data);
    this.submittedDate = this.getformattedDate(data?.submittedDate, 'DD-MMM-YYYY HH:mm');
    this.approvedDate = this.getformattedDate(data?.approvedDate, 'DD-MMM-YYYY HH:mm');
  }

  public get statusLabel(): string {
    return this.reviewStatus === SURVEY_STATUS.UNDER_REVIEW
      ? SURVEY_STATUS.UNDER_REVIEW_FORMATTED
      : this.reviewStatus;
  }

  public get statusClassName(): string {
    return this.statusLabel.replace(/ /g, '').toLowerCase();
  }

  static deserialize(apiData: IAPISurvey): SurveyModel {
    if (!apiData) {
      return new SurveyModel();
    }

    const data: Partial<SurveyModel> = {
      id: apiData.AirportLogisticsStageId,
      airportName: apiData.AirportName,
      ICAO: apiData.ICAO,
      handlerName: apiData.HandlerName,
      submittedDate: apiData.SubmittedDate,
      reviewStatus: apiData.ReviewStatus,
      lastUpdatedUser: apiData.LastUpdatedUser,
      approvedDate: apiData.ApprovedDate,
    };

    return new SurveyModel(data);
  }

  static deserializeList(apiDataList: IAPISurvey[]): SurveyModel[] {
    return Array.isArray(apiDataList)
      ? apiDataList.map(apiData => SurveyModel.deserialize(apiData))
      : []
  }
}
