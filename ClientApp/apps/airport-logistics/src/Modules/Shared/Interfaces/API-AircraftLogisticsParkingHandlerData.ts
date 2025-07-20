import { IAPILogisticsComponent } from './index';
export interface  IAPIAircraftLogisticsParkingHandlerData {
  AircraftLogisticsFilePath: string;
  AircraftParkingLocation: IAPILogisticsComponent[];
  AircraftSpotAccommodation: IAPILogisticsComponent[];
  AircraftTowbarRequirements: IAPILogisticsComponent[];
  AirportEquipments: IAPILogisticsComponent[];
  AirportLogisticsStageId: number;
  TowbarRequired: string;
  TowbarRequirementScenarios: IAPILogisticsComponent[];
}
