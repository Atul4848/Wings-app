import { CoreModel, IdNameCodeModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportParkingReview, IAPIUplinkAirportParkingReview } from '../Interfaces';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS, UplinkStagingReviewModel } from '@wings/shared';

@modelProtection
export class AirportParkingReviewModel extends CoreModel {
  airport: IdNameCodeModel;
  mergeStatus: STAGING_REVIEW_STATUS;
  comparisionType: STAGING_REVIEW_COMPARISION_TYPE;
  airportParkingUplinkStagingProperties: UplinkStagingReviewModel<IAPIUplinkAirportParkingReview>[];
  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<AirportParkingReviewModel>) {
    super(data);
    Object.assign(this, data);
    this.airport = new IdNameCodeModel(data?.airport);
    this.airportParkingUplinkStagingProperties =
      data?.airportParkingUplinkStagingProperties?.map(x => new UplinkStagingReviewModel({ ...x })) || [];
  }

  static deserialize(apiData: IAPIAirportParkingReview): AirportParkingReviewModel {
    if (!apiData) {
      return new AirportParkingReviewModel();
    }
    const data: Partial<AirportParkingReviewModel> = {
      ...apiData,
      id: apiData.id || apiData.vendorAirportParkingId,
      airport: IdNameCodeModel.deserialize({
        ...apiData.airport,
        code: apiData.airport?.code,
        id: apiData.airport?.airportId,
      }),
      airportParkingUplinkStagingProperties: UplinkStagingReviewModel.deserializeList(
        apiData.airportParkingUplinkStagingProperties
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AirportParkingReviewModel(data);
  }

  static deserializeList(apiDataList: any[]): AirportParkingReviewModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => AirportParkingReviewModel.deserialize(apiData)) : [];
  }
}
