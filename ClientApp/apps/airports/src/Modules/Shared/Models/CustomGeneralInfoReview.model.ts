import { CoreModel, IdNameCodeModel, modelProtection } from '@wings-shared/core';
import { IAPICustomGeneralInfoReview, IAPIUplinkCustomGeneralInfoReview } from '../Interfaces';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS, UplinkStagingReviewModel } from '@wings/shared';

@modelProtection
export class CustomGeneralInfoReviewModel extends CoreModel {
  airport: IdNameCodeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType: STAGING_REVIEW_COMPARISION_TYPE;
  customGeneralInfoUplinkStagingProperties: UplinkStagingReviewModel<IAPIUplinkCustomGeneralInfoReview>[];
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<CustomGeneralInfoReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.airport = new IdNameCodeModel(data?.airport);
    this.customGeneralInfoUplinkStagingProperties =
      data?.customGeneralInfoUplinkStagingProperties?.map(x => new UplinkStagingReviewModel({ ...x })) || [];
  }

  static deserialize(apiData: IAPICustomGeneralInfoReview): CustomGeneralInfoReviewModel {
    if (!apiData) {
      return new CustomGeneralInfoReviewModel();
    }
    const data: Partial<CustomGeneralInfoReviewModel> = {
      ...apiData,
      id: apiData.id || apiData.vendorCustomGeneralInfoId,
      airport: IdNameCodeModel.deserialize({
        ...apiData.airport,
        code: apiData.airport?.code,
        id: apiData.airport?.airportId,
      }),
      customGeneralInfoUplinkStagingProperties: UplinkStagingReviewModel.deserializeList(
        apiData.customGeneralInfoUplinkStagingProperties
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new CustomGeneralInfoReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): CustomGeneralInfoReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => CustomGeneralInfoReviewModel.deserialize(apiData)) : [];
  }
}
