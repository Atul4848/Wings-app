import { UserResponseModel } from '../Models';

export interface IAPIOktaResponse {
  data: IAPIUserDataResponse;
}

export interface IAPIUserDataResponse {
  after: string;
  results: UserResponseModel[];
}
