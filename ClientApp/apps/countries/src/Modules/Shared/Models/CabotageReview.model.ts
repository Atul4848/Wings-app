import { CoreModel, IdNameCodeModel, modelProtection } from '@wings-shared/core';
import { IAPICabotageReview, IAPIUplinkCabotageOperationalRequirementReview } from '../Interfaces';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS, UplinkStagingReviewModel } from '@wings/shared';

@modelProtection
export class CabotageReviewModel extends CoreModel {
  country: IdNameCodeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType: STAGING_REVIEW_COMPARISION_TYPE;
  cabotageOperationalRequirementStagingProperties: UplinkStagingReviewModel<
    IAPIUplinkCabotageOperationalRequirementReview
  >[];
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<CabotageReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new IdNameCodeModel(data?.country);
    this.cabotageOperationalRequirementStagingProperties =
      data?.cabotageOperationalRequirementStagingProperties?.map(x => new UplinkStagingReviewModel({ ...x })) || [];
  }

  static deserialize(apiData: IAPICabotageReview): CabotageReviewModel {
    if (!apiData) {
      return new CabotageReviewModel();
    }
    const data: Partial<CabotageReviewModel> = {
      ...apiData,
      id: apiData.id || apiData.vendorCustomGeneralInfoId,
      country: IdNameCodeModel.deserialize({
        ...apiData.country,
        code: apiData.country?.code,
        id: apiData.country?.countryId,
      }),
      cabotageOperationalRequirementStagingProperties: UplinkStagingReviewModel.deserializeList(
        apiData.cabotageOperationalRequirementStagingProperties
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new CabotageReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): CabotageReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => CabotageReviewModel.deserialize(apiData)) : [];
  }
}
