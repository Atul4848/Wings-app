import { IAPILogisticsComponentRequest } from './index';

export interface IAPIPostDepartureLogistics {
  Stage: {
    DepartureLogistics: {
      CrewEarlyArrival: string;
      CrewEarlyArrivalUnit: string;
      PaxEarlyArrival: string;
      PaxEarlyArrivalUnit: string;
      OtherExpectedProcedures: string;
      DepartureAddress: string;
      MeetingLocation: string;
      MeetingLocationFilePath: string;
      DepatureExpectedProcedures: IAPILogisticsComponentRequest[];
    };
  };
  Ignored: {
    DepartureLogistics: {
      CrewEarlyArrivalMins: number;
      DepartureAddress: string;
      PaxEarlyArrivalMins: string;
      MeetingLocation: string;
      MeetingLocationFilePath: string;
      OtherExpectedProcedures: string;
      DepatureExpectedProcedures: IAPILogisticsComponentRequest[];
    };
  };
  DepartureLogisticsId: number;
  AirportLogisticsStageId: number;
  AirportHandlerId: number;
  AirportId: number;
  ApprovedUser: string;
}
