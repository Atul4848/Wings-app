import { IAPIProvider } from '.';
import { DELIVERY_TYPE } from '../Enums';

export interface IAPIChannelResponse {
  Data: IAPIChannel[];
}

export interface IAPIChannel {
  ChannelId: number;
  Name: string;
  Type: DELIVERY_TYPE;
  ProviderId: number;
  Provider?: IAPIProvider;
  ContentSize: number;
  SystemCreated: boolean;
  SystemEnabled: boolean;
  PublicEnabled: boolean;
  Description: string;
  IsUsedInTemplate: boolean;
}

export interface IAPIFilteredChannel {
  ChannelId: number;
  Name: string;
}
