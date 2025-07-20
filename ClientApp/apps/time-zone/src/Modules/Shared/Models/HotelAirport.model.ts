import { CoreModel, EntityMapModel, modelProtection } from '@wings-shared/core';
import { IAPIHotelAirport } from './../Interfaces';

@modelProtection
export class HotelAirportModel extends CoreModel {
  distance: number;
  airport: EntityMapModel;

  constructor(data?: Partial<HotelAirportModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIHotelAirport): HotelAirportModel {
    if (!apiData) {
      return new HotelAirportModel();
    }
    const data: Partial<HotelAirportModel> = {
      id: apiData.hotelAirportId,
      distance: apiData.distance,
      airport: new EntityMapModel({
        entityId: apiData.airport.airportId,
        name: apiData.airport.name || apiData.airport.airportName,
        code: apiData.airport.airportCode || apiData.airport.displayCode,
      }) || null,
    };
    return new HotelAirportModel(data);
  }

  static deserializeList(apiDataList: IAPIHotelAirport[]): HotelAirportModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIHotelAirport) => HotelAirportModel.deserialize(apiData)) : [];
  }
}
