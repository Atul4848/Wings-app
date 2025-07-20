import { modelProtection } from '@wings-shared/core';

@modelProtection
export class RankAtAirportMappingsModel {
  vendorLocationId: number = 0;
  rankAtAirport: number = 0;

  constructor(data?: Partial<RankAtAirportMappingsModel>) {
    Object.assign(this, data);
  }

  static deserialize(apiData: RankAtAirportMappingsModel): RankAtAirportMappingsModel {
    if (!apiData) {
      return new RankAtAirportMappingsModel();
    }
    const data: Partial<RankAtAirportMappingsModel> = {
      ...apiData,
      vendorLocationId: apiData.vendorLocationId,
      rankAtAirport: apiData.rankAtAirport,
    };
    return new RankAtAirportMappingsModel(data);
  }

  public serialize() {
    return {
      vendorLocationId: this.vendorLocationId,
      rankAtAirport: this.rankAtAirport,
    };
  }

  static deserializeList(apiDataList: RankAtAirportMappingsModel[]): RankAtAirportMappingsModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => RankAtAirportMappingsModel.deserialize(apiData)) : [];
  }
}
