import { IAPIOperatingHours, IAPIOperatingHoursRequest } from './index';

export interface IAPICiqMainTerminal {
  SubComponentId: number;
  CIQOvertimeRequired: string;
  OperatingHours: IAPIOperatingHours[];
}

export interface IAPICiqMainTerminalRequest {
  SubComponentId: number;
  CIQOvertimeRequired: string;
  OperatingHours: IAPIOperatingHoursRequest[];
}
