import { CoreModel, SurveyModel } from './index';
import { IAPISurvey } from './../Interfaces/index';
import { SURVEY_STATUS } from './../Enums/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class SurveyListModel extends CoreModel {
  surveys: SurveyModel[] = [];

  constructor(data?: Partial<SurveyListModel>) {
    super();
    Object.assign(this, data);
  }

  public get counts(): { [name: string]: number } {
    return {
      approved: this.getCountByStatus(SURVEY_STATUS.APPROVED),
      underReview: this.getCountByStatus(SURVEY_STATUS.UNDER_REVIEW),
      pending: this.getCountByStatus(SURVEY_STATUS.PENDING),
      total: this.surveys.length,
    }
  }

  private getCountByStatus(status: string): number {
    return this.surveys.filter(survey => survey.reviewStatus === status).length;
  }

  static deserialize(apiData: IAPISurvey[]): SurveyListModel {
    if (!apiData) {
      return new SurveyListModel();
    }

    const data: Partial<SurveyListModel> = {
      surveys: SurveyModel.deserializeList(apiData),
    };

    return new SurveyListModel(data);
  }
}
