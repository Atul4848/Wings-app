import { CoreModel, modelProtection } from '@wings-shared/core';
import { VendorLocationModel } from './VendorLocation.model';
import { RankAtAirportMappingsModel } from './RankAtAirportMappings.model';

@modelProtection
export class RankAtAirportModel extends CoreModel {
  userId: string = '';
  airportId: number = 0;
  isAirportDataManager: boolean = false;
  isCountryDataManager: boolean = false;
  isPermitDataManager: boolean = false;
  vendorLocationAndRankAtAirportMappings: RankAtAirportMappingsModel[] = [];

  constructor(data?: Partial<RankAtAirportModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: RankAtAirportModel): RankAtAirportModel {
    if (!apiData) {
      return new RankAtAirportModel();
    }
    const data: Partial<RankAtAirportModel> = {
      ...apiData,
      vendorLocationAndRankAtAirportMappings: RankAtAirportMappingsModel.deserializeList(
        apiData?.vendorLocationAndRankAtAirportMappings
      ),
    };
    return new RankAtAirportModel(data);
  }

  public serialize() {
    return {
      userId: this.userId,
      airportId: this.airportId,
      isAirportDataManager: this.isAirportDataManager,
      isCountryDataManager: this.isCountryDataManager,
      isPermitDataManager: this.isPermitDataManager,
      vendorLocationAndRankAtAirportMappings: this.vendorLocationAndRankAtAirportMappings,
    };
  }

  static deserializeList(apiDataList: RankAtAirportModel[]): RankAtAirportModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => RankAtAirportModel.deserialize(apiData)) : [];
  }
}
