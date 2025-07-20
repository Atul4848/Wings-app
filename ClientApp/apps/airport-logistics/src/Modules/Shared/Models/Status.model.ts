import { CoreModel } from './Core.model';
import { ApprovalStatus } from '../Interfaces';
import { SurveyReviewStatusModel } from './SurveyReviewStatus.model';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class StatusModel extends CoreModel {
  status: ApprovalStatus;

  constructor(data?: Partial<StatusModel>) {
    super();
    this.status = data ? { ...data.status } : {};
  }

  public updateStatus(update: SurveyReviewStatusModel): void {
    const { key, isApproved, isIgnored } = update;

    if (key) {
      this.status[key].isApproved = isApproved;
      this.status[key].isIgnored = isIgnored;
    }
  }

  public get hasAllAccessed(): boolean {
    return Object.values(this.status).every(key => key.isApproved || key.isIgnored);
  }
}
