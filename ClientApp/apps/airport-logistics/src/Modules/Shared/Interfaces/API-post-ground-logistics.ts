import { IAPILogisticsComponentRequest } from './index';

export interface IAPIPostGroundLogistics {
  Stage: {
    AirportLogistics: {
      OvernightParkingIssue: string;
      ParkingDuration: number;
      ParkingDurationUnit: string;
      MTOW: 0;
      MTOWUnit: string;
      NearbyParkingAirports: string[];
      AircraftRestrictions: IAPILogisticsComponentRequest[];
      TypesOfAircraftOperatedInAirport: IAPILogisticsComponentRequest[];
      ParkingDiffMonths: IAPILogisticsComponentRequest[];
    };
    AirportHandlerLogistics: {
      TowbarRequired: string;
      FilePath: string;
      AircraftParkingLocations: IAPILogisticsComponentRequest[];
      AircraftSpotAccommodations: IAPILogisticsComponentRequest[];
      AircraftTowbarRequirements: IAPILogisticsComponentRequest[];
      TowbarRequirementScenarios: IAPILogisticsComponentRequest[];
      AirportEquipments: IAPILogisticsComponentRequest[];
    };
  };
  Ignored: {
    AirportLogistics: {
      OvernightParkingIssue: string;
      NearbyParkingAirports: string[];
      MaxParkingDurationHours: number;
      MTOWKgs: number;
      AircraftRestrictions: IAPILogisticsComponentRequest[];
      ParkingDiffMonths: IAPILogisticsComponentRequest[];
      TypesOfAircraftOperatedInAirport: IAPILogisticsComponentRequest[];
    };
    AirportHandlerLogistics: {
      TowbarRequired: string;
      FilePath: string;
      AircraftParkingLocations: IAPILogisticsComponentRequest[];
      AircraftSpotAccommodations: IAPILogisticsComponentRequest[];
      AircraftTowbarRequirements: IAPILogisticsComponentRequest[];
      TowbarRequirementScenarios: IAPILogisticsComponentRequest[];
      AirportEquipments: IAPILogisticsComponentRequest[];
    };
  };
  AirportLogisticsStageId: number;
  AirportHandlerId: number;
  AirportId: number;
  ApprovedUser: string;
}
