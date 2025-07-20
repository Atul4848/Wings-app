import { IAPILogisticsComponent, IAPISurvey } from './index';

export interface IAPIAircraftLogisticsParkingAirportData {
  AirportLogisticsStageId: number;
  AircraftRestrictions: IAPILogisticsComponent[];
  MaxParkingDurationHours: number;
  MTOW: number;
  MTOWKgs: number;
  MTOW_Units: string;
  NearbyParkingAirports: string;
  OvernightParkingIssue: string;
  ParkingDuration: number;
  ParkingDurationUnit: string;
  ParkingDiffMonths: IAPILogisticsComponent[];
  TypesOfAircraftOperatedInAirport: IAPILogisticsComponent[];
  HandlerName: string;
  SurveyInfo: IAPISurvey;
}
