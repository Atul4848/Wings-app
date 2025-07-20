import { CoreModel, IdNameCodeModel } from '@wings-shared/core';
import { STAGING_REVIEW_STATUS, STAGING_REVIEW_COMPARISION_TYPE } from '@wings/shared';
import { IAPIUplinkAirportHourReview } from '../Interfaces';


export class AirportHourUplinkStagingReviewModel extends CoreModel {
    tableName: string;
    propertyName: string;
    oldValue: string;
    newValueId: number | null;
    newValueCode: string | IdNameCodeModel;
    newValue: string;
    isList: boolean = false;
    mergeStatus: STAGING_REVIEW_STATUS;
    comparisonType?: STAGING_REVIEW_COMPARISION_TYPE;
   
    constructor(data?: Partial<AirportHourUplinkStagingReviewModel>) {
      super(data);
      Object.assign(this, data);
    }
   
    static deserialize(apiData: IAPIUplinkAirportHourReview): AirportHourUplinkStagingReviewModel {
      if (!apiData) {
        return new AirportHourUplinkStagingReviewModel();
      }
      const data: Partial<AirportHourUplinkStagingReviewModel> = {
        ...apiData,
        ...CoreModel.deserializeAuditFields(apiData),
      };
      return new AirportHourUplinkStagingReviewModel(data);
    }
   
    static deserializeList(apiDataList: any[]): AirportHourUplinkStagingReviewModel[] {
      return apiDataList
        ? apiDataList.map((apiData: any) => AirportHourUplinkStagingReviewModel.deserialize(apiData))
        : [];
    }
}
