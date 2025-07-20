import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIWorldEventReview } from '../Interfaces';
import { UplinkWorldEventsReviewModel } from './UplinkWorldEventsReview.model';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS } from '@wings/shared';

@modelProtection
export class WorldEventsReviewModel extends CoreModel {
  worldEventType?: SettingsTypeModel;
  worldEventCategory?: SettingsTypeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType: STAGING_REVIEW_COMPARISION_TYPE;
  refDataId: Number;
  uplinkStagingProperties: UplinkWorldEventsReviewModel[];
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<WorldEventsReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.uplinkStagingProperties =
      data?.uplinkStagingProperties?.map(
        (model: UplinkWorldEventsReviewModel) =>
          new UplinkWorldEventsReviewModel({ ...model, comparisionType: data?.comparisionType })
      ) || [];
  }

  static deserialize(apiData: IAPIWorldEventReview): WorldEventsReviewModel {
    if (!apiData) {
      return new WorldEventsReviewModel();
    }
    const data: Partial<WorldEventsReviewModel> = {
      ...apiData,
      id: apiData.id,
      refDataId: apiData.refDataId,
      name: apiData.name,
      worldEventType: new SettingsTypeModel({
        ...apiData.worldEventType,
        id: apiData.worldEventType?.worldEventTypeId,
      }),
      worldEventCategory: new SettingsTypeModel({
        ...apiData.worldEventCategory,
        id: apiData.worldEventCategory?.worldEventCategoryId,
      }),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new WorldEventsReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): WorldEventsReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => WorldEventsReviewModel.deserialize(apiData)) : [];
  }
}
