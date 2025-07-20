import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIUserRef extends IBaseApiResponse {
  Id?: string;
  personId?: number;
  personGuid: string;
  firstName: string;
  lastName: string;
  email: string;
  UserGuid?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Username?: string;
  UVGOProfile?: IUVGOProfile;
}

interface IUVGOProfile {
  CSDUserId: number;
  CSDUsername?: string;
  csdUsername?: string;
}
