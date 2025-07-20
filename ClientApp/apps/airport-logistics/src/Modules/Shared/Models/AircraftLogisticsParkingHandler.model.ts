import { CoreModel, AircraftLogisticsParkingHandlerDataModel } from './index';
import { IAPIAircraftLogisticsParkingHandler } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class AircraftLogisticsParkingHandlerModel extends CoreModel {
  approved: AircraftLogisticsParkingHandlerDataModel;
  unApproved: AircraftLogisticsParkingHandlerDataModel;

  constructor(data?: Partial<AircraftLogisticsParkingHandlerModel>) {
    super();
    this.approved = new AircraftLogisticsParkingHandlerDataModel(data?.approved);
    this.unApproved = new AircraftLogisticsParkingHandlerDataModel(data?.unApproved);
  }

  static deserialize(apiData: IAPIAircraftLogisticsParkingHandler): AircraftLogisticsParkingHandlerModel {
    if (!apiData) {
      return new AircraftLogisticsParkingHandlerModel();
    }

    const data: Partial<AircraftLogisticsParkingHandlerModel> = {
      approved: AircraftLogisticsParkingHandlerDataModel.deserialize(apiData.ApprovedData),
      unApproved: AircraftLogisticsParkingHandlerDataModel.deserialize(apiData.StageData),
    };

    return new AircraftLogisticsParkingHandlerModel(data);
  }
}
