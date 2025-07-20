import { IAPIOperatingHours, IAPIOperatingHoursRequest } from './index';

export interface IAPIMainTerminal {
  SubComponentId: number;
  CIQRequired: string;
  OperatingHours: IAPIOperatingHours[];
  CrewPaxPriority: string;
  CrewPaxPriorityExplanation: string;
}

export interface IAPIMainTerminalRequest {
  SubComponentId: number;
  CIQRequired: string;
  OperatingHours: IAPIOperatingHoursRequest[];
  CrewPaxPriority: string;
  CrewPaxPriorityExplanation: string;
}
