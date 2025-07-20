import { IAPIOperatingHours } from './API-OperatingHours.interface';

export interface IAPIHandlerHours {
  SubComponentId: number;
  OperatingHours: IAPIOperatingHours[];
}
