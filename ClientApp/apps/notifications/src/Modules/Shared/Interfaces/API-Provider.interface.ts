import { DELIVERY_TYPE } from '../Enums';

export interface IAPIProviderResponse {
  Data: IAPIProvider[];
}

export interface IAPIProvider {
  ProviderId: number;
  Name: string;
  DeliveryType: DELIVERY_TYPE;
}
