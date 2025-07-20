import { CoreModel, AircraftLogisticsParkingAirportDataModel } from './index';
import { IAPIAircraftLogisticsParkingAirport } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class AircraftLogisticsParkingAirportModel extends CoreModel {
  approved: AircraftLogisticsParkingAirportDataModel;
  unApproved: AircraftLogisticsParkingAirportDataModel;

  constructor(data?: Partial<AircraftLogisticsParkingAirportModel>) {
    super();
    Object.assign(this, data);
    this.approved = new AircraftLogisticsParkingAirportDataModel(data?.approved);
    this.unApproved = new AircraftLogisticsParkingAirportDataModel(data?.unApproved);
  }

  static deserialize(apiData: IAPIAircraftLogisticsParkingAirport): AircraftLogisticsParkingAirportModel {
    if (!apiData) {
      return new AircraftLogisticsParkingAirportModel();
    }

    const data: Partial<AircraftLogisticsParkingAirportModel> = {
      approved: AircraftLogisticsParkingAirportDataModel.deserialize(apiData.ApprovedData),
      unApproved: AircraftLogisticsParkingAirportDataModel.deserialize(apiData.StageData),
    };

    return new AircraftLogisticsParkingAirportModel(data);
  }
}
