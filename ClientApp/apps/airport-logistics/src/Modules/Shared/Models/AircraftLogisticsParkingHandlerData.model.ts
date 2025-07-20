import { LogisticsComponentModel } from './index';
import { ApprovalStatus, IAPIAircraftLogisticsParkingHandlerData } from '../Interfaces/index';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class AircraftLogisticsParkingHandlerDataModel extends StatusModel {
  aircraftLogisFile: string = '';
  aircraftParkingLocation: LogisticsComponentModel[] = [];
  aircraftSpotAccommodation: LogisticsComponentModel[] = [];
  aircraftTowbarRequirements: LogisticsComponentModel[] = [];
  airportEquipments: LogisticsComponentModel[] = [];
  airportLogisticsStageId: number = null;
  towbarRequired: string = '';
  towbarRequirementScenarios: LogisticsComponentModel[] = [];

  constructor(data?: Partial<AircraftLogisticsParkingHandlerDataModel>) {
    super();
    Object.assign(this, data);
    this.status = data?.status || this.approvalStatus;
  }

  public get approvalStatus(): ApprovalStatus {
    return {
      aircraftLogisFile: {
        isApproved: false,
        isIgnored: false,
      },
      aircraftParkingLocation: {
        isApproved: false,
        isIgnored: false,
      },
      aircraftSpotAccommodation: {
        isApproved: false,
        isIgnored: false,
      },
      aircraftTowbarRequirements: {
        isApproved: false,
        isIgnored: false,
      },
      airportEquipments: {
        isApproved: false,
        isIgnored: false,
      },
      towbarRequired: {
        isApproved: false,
        isIgnored: false,
      },
      towbarRequirementScenarios: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  static deserialize(apiData: IAPIAircraftLogisticsParkingHandlerData): AircraftLogisticsParkingHandlerDataModel {
    if (!apiData) {
      return new AircraftLogisticsParkingHandlerDataModel();
    }

    const data: Partial<AircraftLogisticsParkingHandlerDataModel> = {
      aircraftLogisFile: apiData.AircraftLogisticsFilePath,
      aircraftParkingLocation: LogisticsComponentModel.deserializeList(apiData.AircraftParkingLocation),
      aircraftSpotAccommodation: LogisticsComponentModel.deserializeList(apiData.AircraftSpotAccommodation),
      aircraftTowbarRequirements: LogisticsComponentModel.deserializeList(apiData.AircraftTowbarRequirements),
      airportEquipments: LogisticsComponentModel.deserializeList(apiData.AirportEquipments),
      airportLogisticsStageId: apiData.AirportLogisticsStageId,
      towbarRequired: apiData.TowbarRequired,
      towbarRequirementScenarios: LogisticsComponentModel.deserializeList(apiData.TowbarRequirementScenarios),
    };

    return new AircraftLogisticsParkingHandlerDataModel(data);
  }
}
