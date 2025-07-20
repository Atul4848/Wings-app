import { IAPIChannel, IAPIEventType } from '.';
import { DELIVERY_TYPE } from '../Enums';

export interface IAPITemplateResponse {
  Data: IAPITemplate[];
}

export interface IAPITemplate {
  TemplateId: number;
  TemplateGuid: string;
  Name: string;
  DeliveryType: DELIVERY_TYPE;
  DeliveryTypeName: string;
  Channel?: IAPIChannel;
  ChannelId: number;
  EventType?: IAPIEventType;
  EventTypeId: number;
  Content: string;
  Description: string;
  TestData: string;
  DefaultTemplate: boolean;
  Version: number;
  Subject: string;
  SendGridTemplateId: string;
}
