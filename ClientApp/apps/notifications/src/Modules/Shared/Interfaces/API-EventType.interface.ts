import { IAPIFieldDefinition } from './API-FieldDefinition.interface';

export interface IAPIEventTypeResponse {
  Data: IAPIEventType[];
}

export interface IAPIEventType {
  EventTypeId: number;
  Name: string;
  Category: string;
  SubCategory: string;
  Description: string;
  SystemCreated: boolean;
  PublicEnabled: boolean;
  SystemEnabled: boolean;
  ModelDefinition?: IAPIFieldDefinition[];
  InUse: boolean,
}
