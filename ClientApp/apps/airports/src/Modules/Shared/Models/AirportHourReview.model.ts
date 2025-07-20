import { CoreModel, IdNameCodeModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirportHourReview, IAPIUplinkAirportHourReview } from '../Interfaces';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS, UplinkStagingReviewModel } from '@wings/shared';

@modelProtection
export class AirportHourReviewModel extends CoreModel {
  cappsSequenceId: number;
  airportHoursType: SettingsTypeModel;
  airport: IdNameCodeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType: STAGING_REVIEW_COMPARISION_TYPE;
  uplinkStagingProperties: UplinkStagingReviewModel<IAPIUplinkAirportHourReview>[];
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<AirportHourReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.airport = new IdNameCodeModel(data?.airport);
    this.uplinkStagingProperties =
      data?.uplinkStagingProperties?.map(x => new UplinkStagingReviewModel({ ...x })) || []
  }

  static deserialize(apiData: IAPIAirportHourReview): AirportHourReviewModel {
    if (!apiData) {
      return new AirportHourReviewModel();
    }
    const data: Partial<AirportHourReviewModel> = {
      ...apiData,
      id: apiData.id || apiData.airportHourStagingId,
      airport: IdNameCodeModel.deserialize({
        ...apiData.airport,
        code: apiData.airport?.code,
        id: apiData.airport?.airportId,
      }),
      airportHoursType: new SettingsTypeModel({
        ...apiData.airportHoursType,
        id: apiData.airportHoursType?.airportHoursTypeId,
      }),
      uplinkStagingProperties: UplinkStagingReviewModel.deserializeList(apiData.uplinkStagingProperties),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AirportHourReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): AirportHourReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => AirportHourReviewModel.deserialize(apiData)) : [];
  }
}
