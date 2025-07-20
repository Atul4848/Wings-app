import { MESSAGE_LEVEL } from '../Enums';
import { IAPIEventType, IAPIFieldDefinition } from './index';

export interface IAPIEvent {
  EventId: number;
  EventGuid?: string;
  TriggerTime: string;
  Status?: string;
  Subject: string;
  Content: string;
  EventTypeId: number;
  AttributeDefinition: IAPIFieldDefinition[];
  EventType?: IAPIEventType;
  Level: MESSAGE_LEVEL;
}
