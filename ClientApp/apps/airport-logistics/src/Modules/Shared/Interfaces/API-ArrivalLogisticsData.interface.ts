
import { IAPILogisticsComponent } from './API-LogiscticsComponent.interface';

export interface  IAPIArrivalLogisticsData {
  WalkDistance: string // unapproved only.
  WalkDistanceMeters: number;
  WalkDistanceOperand: string
  ArrivalExpectedProcedures: IAPILogisticsComponent[];
  AirportLogisticsStageId: number;
  RampSideShuttleAvailable: string;
  DisabilitiesAccomomodationAvailability: IAPILogisticsComponent[];
  ArrivalCrewPaxPassportHandling: IAPILogisticsComponent[];
  ArrivalLuggageHandling: IAPILogisticsComponent[];
  ArrivalMeetingPoint: IAPILogisticsComponent[];
  ArrivalAddress: string;
  AdditionalInstructionsForGate: string;
}
