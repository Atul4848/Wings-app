import { CoreModel } from './Core.model';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class SurveyReviewStatusModel extends CoreModel {
  key: string = '';
  isApproved: boolean = false;
  isIgnored: boolean = false;

  constructor(data?: Partial<SurveyReviewStatusModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: any): SurveyReviewStatusModel {
    if (!apiData) {
      return new SurveyReviewStatusModel();
    }

    const data: Partial<SurveyReviewStatusModel> = {
      key: apiData.key,
      isApproved: apiData.isApproved,
      isIgnored: apiData.isIgnored,
    };

    return new SurveyReviewStatusModel(data);
  }
}
