import { MESSAGE_LEVEL, DND_FILTER_TYPE } from '../Enums';

export interface IAPIDNDFilter {
  DNDFilterId: number;
  Name: string;
  StartTime: string;
  StopTime: string;
  Level: MESSAGE_LEVEL;
  FilterType: DND_FILTER_TYPE;
  DaysOfWeek: string[];
  IsEnabled: boolean;
  OktaUserId: string;
  OktaUsername: string;
  EventTypeIds: number[];
  DeliveryTypes: string[];
}
