import { CoreModel, IdNameCodeModel } from '@wings-shared/core';
import { IAPIMilitaryUplinkStaging, IAPIMilitaryUplinkStagingProperty } from '../Interfaces';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS, UplinkStagingReviewModel } from '@wings/shared';

export class MilitaryFieldsReviewModel extends CoreModel {
  airport: IdNameCodeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType: STAGING_REVIEW_COMPARISION_TYPE;
  airportMilitaryUplinkStagingProperties: UplinkStagingReviewModel<IAPIMilitaryUplinkStagingProperty>[];
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<MilitaryFieldsReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.airport = new IdNameCodeModel(data?.airport);
    this.airportMilitaryUplinkStagingProperties =
      data?.airportMilitaryUplinkStagingProperties?.map(x => new UplinkStagingReviewModel({ ...x })) || [];
  }

  static deserialize(apiData: IAPIMilitaryUplinkStaging): MilitaryFieldsReviewModel {
    if (!apiData) {
      return new MilitaryFieldsReviewModel();
    }
    const data: Partial<MilitaryFieldsReviewModel> = {
      ...apiData,
      id: apiData.id,
      airport: IdNameCodeModel.deserialize({
        ...apiData.airport,
        id: apiData.airport?.airportId,
        name: apiData.airport?.name,
        code: apiData.airport?.code,
      }),
      airportMilitaryUplinkStagingProperties: UplinkStagingReviewModel.deserializeList(
        apiData.airportMilitaryUplinkStagingProperties
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new MilitaryFieldsReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): MilitaryFieldsReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => MilitaryFieldsReviewModel.deserialize(apiData)) : [];
  }
}
