import { CoreModel, IBaseApiResponse, IdNameCodeModel } from '@wings-shared/core';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS } from '../Enums';

export class UplinkStagingReviewModel<TAPI extends IBaseApiResponse> extends CoreModel {
    tableName: string;
    propertyName: string;
    oldValue: string;
    newValueId: number | null;
    newValueCode: string | IdNameCodeModel;
    newValue: string;
    isList: boolean = false;
    mergeStatus: STAGING_REVIEW_STATUS;
    comparisonType?: STAGING_REVIEW_COMPARISION_TYPE;
   
    constructor(data?: Partial<UplinkStagingReviewModel<TAPI>>) {
      super(data);
      Object.assign(this, data);
    }
   
    static deserialize<TAPI extends IBaseApiResponse>(apiData: TAPI): UplinkStagingReviewModel<TAPI> {
      if (!apiData) {
        return new UplinkStagingReviewModel<TAPI>();
      }
      const data: Partial<UplinkStagingReviewModel<TAPI>> = {
        ...apiData,
        ...CoreModel.deserializeAuditFields(apiData),
      };
      return new UplinkStagingReviewModel<TAPI>(data);
    }
   
    static deserializeList<TAPI extends IBaseApiResponse>(apiDataList: TAPI[]): UplinkStagingReviewModel<TAPI>[] {
      return apiDataList
        ? apiDataList.map((apiData: TAPI) => UplinkStagingReviewModel.deserialize<TAPI>(apiData))
        : [];
    }
}
