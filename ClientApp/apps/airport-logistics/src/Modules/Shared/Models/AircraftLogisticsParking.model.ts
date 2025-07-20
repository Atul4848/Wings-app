import { CoreModel, AircraftLogisticsParkingAirportModel, AircraftLogisticsParkingHandlerModel } from './index';
import { IAPIAircraftLogisticsParking } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class AircraftLogisticsParkingModel extends CoreModel {
  airport: AircraftLogisticsParkingAirportModel;
  handler: AircraftLogisticsParkingHandlerModel;

  constructor(data?: Partial<AircraftLogisticsParkingModel>) {
    super();
    Object.assign(this, data);
    this.airport = new AircraftLogisticsParkingAirportModel(data?.airport);
    this.handler = new AircraftLogisticsParkingHandlerModel(data?.handler);
  }

  static deserialize(apiData: IAPIAircraftLogisticsParking): AircraftLogisticsParkingModel {
    if (!apiData) {
      return new AircraftLogisticsParkingModel();
    }

    const data: Partial<AircraftLogisticsParkingModel> = {
      airport: AircraftLogisticsParkingAirportModel.deserialize(apiData.AirportData),
      handler: AircraftLogisticsParkingHandlerModel.deserialize(apiData.AirportHandlerData),
    };

    return new AircraftLogisticsParkingModel(data);
  }
}
