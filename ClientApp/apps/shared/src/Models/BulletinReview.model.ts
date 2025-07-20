import { CoreModel, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS } from '../Enums';
import { IAPIBulletinReview, IAPIUplinkStagingProps } from '../Interfaces';
import { UplinkStagingReviewModel } from './UplinkStagingReview.model';

export class BulletinReviewModel extends CoreModel {
  bulletinLevel: SettingsTypeModel;
  bulletinEntity: IdNameCodeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisonType: STAGING_REVIEW_COMPARISION_TYPE;
  uplinkBulletinStagings: UplinkStagingReviewModel<IAPIUplinkStagingProps>[];
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  // used for updating CAPPS Category Code
  newValue: IdNameCodeModel;
  uplinkBulletinStagingId: number;

  constructor(data?: Partial<BulletinReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.uplinkBulletinStagings = data?.uplinkBulletinStagings?.map(x => new UplinkStagingReviewModel({ ...x })) || [];
  }

  static deserialize(apiData: IAPIBulletinReview): BulletinReviewModel {
    if (!apiData) {
      return new BulletinReviewModel();
    }
    const data: Partial<BulletinReviewModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id || apiData.bulletinStagingId,
      bulletinLevel: new SettingsTypeModel({
        ...apiData.bulletinLevel,
        id: apiData.bulletinLevel?.bulletinLevelId,
      }),
      bulletinEntity: new IdNameCodeModel({
        ...apiData.bulletinEntity,
        id: apiData.bulletinEntityId,
        code: apiData.bulletinEntityCode,
        name: apiData.bulletinEntityName,
      }),
      uplinkBulletinStagings: UplinkStagingReviewModel.deserializeList(apiData.uplinkBulletinStagings),
    };
    return new BulletinReviewModel(data);
  }

  static deserializeList(apiDataList: IAPIBulletinReview[]): BulletinReviewModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIBulletinReview) => BulletinReviewModel.deserialize(apiData))
      : [];
  }
}
