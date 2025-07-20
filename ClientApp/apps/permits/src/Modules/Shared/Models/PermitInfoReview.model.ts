import { CoreModel, IdNameCodeModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPermitInfoReview, IAPIUplinkPermitInfoReview } from '../Interfaces';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS, UplinkStagingReviewModel } from '@wings/shared';

@modelProtection
export class PermitInfoReviewModel extends CoreModel {
  country: IdNameCodeModel;
  permitType: SettingsTypeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType: STAGING_REVIEW_COMPARISION_TYPE;
  permitUplinkStagingProperties: UplinkStagingReviewModel<IAPIUplinkPermitInfoReview>[];
  permitStagingPropertyId:number;
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<PermitInfoReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new IdNameCodeModel(data?.country);
    this.permitUplinkStagingProperties =
      data?.permitUplinkStagingProperties?.map(x => new UplinkStagingReviewModel({ ...x })) || [];
  }

  static deserialize(apiData: IAPIPermitInfoReview): PermitInfoReviewModel {
    if (!apiData) {
      return new PermitInfoReviewModel();
    }
    const data: Partial<PermitInfoReviewModel> = {
      ...apiData,
      id: apiData.id || apiData.vendorPermitId,
      country: IdNameCodeModel.deserialize({
        ...apiData.country,
        code: apiData.country?.countryCode,
        name: apiData.country?.countryName,
        id: apiData.country?.countryId,
      }),
      permitType: new SettingsTypeModel({
        ...apiData.permitType,
        id: apiData.permitType?.permitTypeId,
      }),
      permitUplinkStagingProperties: UplinkStagingReviewModel.deserializeList(apiData.permitUplinkStagingProperties),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new PermitInfoReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): PermitInfoReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => PermitInfoReviewModel.deserialize(apiData)) : [];
  }
}
