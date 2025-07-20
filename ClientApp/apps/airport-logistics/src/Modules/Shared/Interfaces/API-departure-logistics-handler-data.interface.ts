import { IAPILogisticsComponent } from './API-LogiscticsComponent.interface';

export interface IAPIDepartureHandlerData {
  DepartureAddress: string;
  MeetingLocation: string;
  MeetingLocationFilePath: string;
  OtherExpectedProcedures: string;
  DepartureProcedures: IAPILogisticsComponent[];
  DepartureHandlerLogisticsId: number;
}
