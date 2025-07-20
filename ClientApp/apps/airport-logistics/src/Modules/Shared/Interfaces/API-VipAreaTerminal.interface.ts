import { IAPIOperatingHours, IAPIOperatingHoursRequest } from './index';

export interface IAPIVipAreaTerminal {
  SubComponentId: string;
  FeeType: string;
  OperatingHours: IAPIOperatingHours[];
  OverTimeCost: number;
  OverTimeType: string;
  OvertimePossible: string;
  UsageCost: number;
}

export interface IAPIVipAreaTerminalRequest {
  SubComponentId: string;
  FeeType: string;
  OperatingHours: IAPIOperatingHoursRequest[];
  OverTimeCost: number;
  OverTimeType: string;
  OvertimePossible: string;
  UsageCost: number;
}
