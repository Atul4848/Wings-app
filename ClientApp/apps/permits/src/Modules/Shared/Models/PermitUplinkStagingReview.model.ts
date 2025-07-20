import { CoreModel, IdNameCodeModel } from '@wings-shared/core';
import { STAGING_REVIEW_STATUS, STAGING_REVIEW_COMPARISION_TYPE } from '@wings/shared';
import { IAPIUplinkPermitInfoReview } from '../Interfaces/API-permit-info-review.interface';


export class PermitUplinkStagingReviewModel extends CoreModel {
    tableName: string;
    propertyName: string;
    oldValue: string;
    newValueId: number | null;
    newValueCode: string | IdNameCodeModel;
    newValue: string;
    isList: boolean = false;
    mergeStatus: STAGING_REVIEW_STATUS;
    comparisonType?: STAGING_REVIEW_COMPARISION_TYPE;
   
    constructor(data?: Partial<PermitUplinkStagingReviewModel>) {
      super(data);
      Object.assign(this, data);
    }
   
    static deserialize(apiData: IAPIUplinkPermitInfoReview): PermitUplinkStagingReviewModel {
      if (!apiData) {
        return new PermitUplinkStagingReviewModel();
      }
      const data: Partial<PermitUplinkStagingReviewModel> = {
        ...apiData,
        ...CoreModel.deserializeAuditFields(apiData),
      };
      return new PermitUplinkStagingReviewModel(data);
    }
   
    static deserializeList(apiDataList: any[]): PermitUplinkStagingReviewModel[] {
      return apiDataList
        ? apiDataList.map((apiData: any) => PermitUplinkStagingReviewModel.deserialize(apiData))
        : [];
    }
}
