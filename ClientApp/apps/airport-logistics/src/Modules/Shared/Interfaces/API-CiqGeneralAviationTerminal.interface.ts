import { IAPIOperatingHours } from './index';

export interface IAPICiqGeneralAviationTerminal {
  SubComponentId: number;
  CIQAvailable: string;
  Cost: number;
  CostType: string;
  LimitedHoursPossible: string;
  OperatingHours: IAPIOperatingHours[];
}
