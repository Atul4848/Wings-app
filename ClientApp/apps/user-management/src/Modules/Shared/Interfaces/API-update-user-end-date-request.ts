import { IAPIBaseUpdateUserRequest } from './API-base-user-update-request';

export interface IAPIUpdateUserEndDateRequest extends IAPIBaseUpdateUserRequest {
  endDate: string;
}
