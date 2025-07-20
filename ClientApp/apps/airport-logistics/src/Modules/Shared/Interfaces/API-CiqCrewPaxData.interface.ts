import {
  IAPILogisticsComponent,
  IAPICiqGeneralAviationTerminal,
  IAPIMainTerminal,
  IAPICiqMainTerminal,
  IAPIVipAreaTerminal,
  IAPILogisticsComponentRequest,
  IAPICiqMainTerminalRequest,
  IAPIMainTerminalRequest,
  IAPIVipAreaTerminalRequest,
} from './index';

export interface IAPICiqCrewPaxData {
  SubComponentId: number;
  CrewPaxCustomsClearanceNoticeHours: number;
  AdvanceNoticeUnit: string;
  AirportFacilities: IAPILogisticsComponent[];
  CrewPaxOnBoardCustomsClearance: string;
  GenDecAdditionalProcedures: IAPILogisticsComponent[];
  GenDecAssistanceRequired: string;
  GenDecFilePath: string;
  GenDecRequired: string;
  GeneralAviationTerminal: IAPICiqGeneralAviationTerminal;
  MainTerminal: IAPIMainTerminal;
  CIQMainTerminal: IAPICiqMainTerminal;
  SpecificGenDecTypeRequired: string;
  VIPAreaTerminal: IAPIVipAreaTerminal;
}

export interface IAPICiqCrewPaxDataApproved {
  SubComponentId: number;
  CrewPaxCustomsClearanceNoticeHours: number;
  AirportFacilities: Partial<IAPILogisticsComponent>[];
  CrewPaxOnBoardCustomsClearance: boolean;
  GenDecAdditionalProcedures: Partial<IAPILogisticsComponent>[];
  GenDecAssistanceRequired: boolean;
  GenDecFilePath: string;
  GenDecRequired: boolean;
  GeneralAviationTerminal: IAPICiqGeneralAviationTerminal;
  MainTerminal: IAPIMainTerminal;
  CIQMainTerminal: IAPICiqMainTerminalRequest;
  SpecificGenDecTypeRequired: boolean;
  VIPAreaTerminal: IAPIVipAreaTerminal;
}

export interface IAPICiqCrewPaxDataRequest {
  AdvanceNoticeOnBoardCrewPaxCustClearnce: number;
  AdvanceNoticeUnit: string;
  AirportFacilities: IAPILogisticsComponentRequest[];
  CrewPaxOnBoardCustomsClearance: string;
  GenDecAdditionalProcedures: IAPILogisticsComponentRequest[];
  GenDecAssistanceRequired: string;
  GenDecFilePath: string;
  GenDecRequired: string;
  GeneralAviationTerminal: IAPICiqGeneralAviationTerminal;
  MainTerminal: IAPIMainTerminalRequest;
  CIQMainTerminal: IAPICiqMainTerminalRequest;
  SpecificGenDecTypeRequired: string;
  VIPAreaTerminal: IAPIVipAreaTerminalRequest;
}

export interface IAPICiqCrewPaxIgnoredDataRequest {
  AirportFacilities: IAPILogisticsComponentRequest[];
  CrewPaxOnBoardCustomsClearance: boolean;
  GenDecAdditionalProcedures: IAPILogisticsComponentRequest[];
  GenDecAssistanceRequired: boolean;
  GenDecFilePath: string;
  GenDecRequired: boolean;
  GeneralAviationTerminal: IAPICiqGeneralAviationTerminal;
  MainTerminal: IAPIMainTerminalRequest;
  CIQMainTerminal: IAPICiqMainTerminalRequest;
  SpecificGenDecTypeRequired: boolean;
  VIPAreaTerminal: IAPIVipAreaTerminalRequest;
  CrewPaxCustomsClearanceNoticeHours: number;
}
