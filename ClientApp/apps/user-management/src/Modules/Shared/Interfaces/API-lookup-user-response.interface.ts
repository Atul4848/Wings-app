import { IAPIUserResponse } from './API-user-response.interface';

export interface IAPILookupUserResponse {
  Users: IAPIUserFound[];
  HasData: boolean;
}

export interface IAPIUserFound {
  User: IAPIUserResponse;
  Message: string;
}
