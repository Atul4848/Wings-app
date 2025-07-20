import {
  CoreModel,
  EntityMapModel,
  SettingsTypeModel,
  modelProtection,
} from '@wings-shared/core';
import { IAPIAirportParking, IAPIAirportParkingRequest } from '../Interfaces';

@modelProtection
export class AirportParkingModel extends CoreModel {
  maximumParkingDuration: number;
  overnightParking: SettingsTypeModel;
  appliedParkingAlternateAirports: EntityMapModel[] = [];
  airportSeasonalParking: EntityMapModel[] = [];

  constructor(data?: Partial<AirportParkingModel>) {
    super(data);
    Object.assign(this, data);
    this.appliedParkingAlternateAirports =
      data?.appliedParkingAlternateAirports?.map(
        (x) => new EntityMapModel(x)
      ) || [];
    this.airportSeasonalParking =
      data?.airportSeasonalParking?.map((x) => new EntityMapModel(x)) || [];
  }

  static deserialize(apiData: IAPIAirportParking): AirportParkingModel {
    if (!apiData) {
      return new AirportParkingModel();
    }
    const data: Partial<AirportParkingModel> = {
      ...apiData,
      id: apiData.airportParkingId || apiData.id,
      airportSeasonalParking: apiData.airportSeasonalParking?.map(
        (x) =>
          new EntityMapModel({
            ...x,
            id: x.airportSeasonalParkingId || x.id,
            entityId:
              x.seasonalParkingDifficultyMonth
                ?.seasonalParkingDifficultyMonthId,
            name: x.seasonalParkingDifficultyMonth?.name,
          })
      ),
      overnightParking: SettingsTypeModel.deserialize({
        ...apiData?.overnightParking,
        id:
          apiData.overnightParking?.OvernightParkingId ||
          apiData.overnightParking?.id,
      }),
      appliedParkingAlternateAirports:
        apiData.appliedParkingAlternateAirports?.map(
          (x) =>
            new EntityMapModel({
              id: x.appliedParkingAlternateAirportId || x.id,
              entityId: x.airport?.airportId,
              name: x.airport?.name || x.airport?.airportName,
              code: x.airport?.code || x.airport?.displayCode,
            })
        ),
    };
    return new AirportParkingModel(data);
  }

  public serialize(): IAPIAirportParkingRequest {
    return {
      id: this.id || 0,
      maximumParkingDuration: Number(this.maximumParkingDuration),
      overnightParkingId: this.overnightParking?.id,
      appliedParkingAlternateAirports:
        this.appliedParkingAlternateAirports?.map((x) => ({
          id: x.id,
          parkingAlternateAirportId: x.entityId,
        })),
      airportSeasonalParking: this.airportSeasonalParking.map((x) => ({
        id: x.id,
        seasonalParkingDifficultyMonth: x.entityId,
      })),
    };
  }
}
