import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIUplinkWorldEventsReview } from '../Interfaces';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS } from '@wings/shared';

@modelProtection
export class UplinkWorldEventsReviewModel extends CoreModel {
  tableName: string;
  propertyName: string;
  oldValue: string;
  newValueId: number | null;
  newValueCode: string;
  newValue: string;
  isList: boolean = false;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType?: STAGING_REVIEW_COMPARISION_TYPE;

  constructor(data?: Partial<UplinkWorldEventsReviewModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIUplinkWorldEventsReview): UplinkWorldEventsReviewModel {
    if (!apiData) {
      return new UplinkWorldEventsReviewModel();
    }
    const data: Partial<UplinkWorldEventsReviewModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new UplinkWorldEventsReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): UplinkWorldEventsReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => UplinkWorldEventsReviewModel.deserialize(apiData)) : [];
  }
}
