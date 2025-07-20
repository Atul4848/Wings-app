import { IAPIHandlerHours } from './index';

export interface IAPICiqHandlerData {
  AirportLogisticsStageId: number;
  CIQHoursForGATOrFBO: IAPIHandlerHours;
  PrivateFBOOperatingHours: IAPIHandlerHours;
}
