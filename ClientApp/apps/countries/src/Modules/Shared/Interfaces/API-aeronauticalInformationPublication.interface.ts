import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry } from '@wings/shared';

export interface IAPIAeronauticalInformationPublication extends IBaseApiResponse {
  aeronauticalInformationPublicationId?: number;
  aipLink: string;
  aipUsername: string;
  aipPassword: string;
  country?: IAPICountry;
  countryId?: number;
  description?: string;
  aipSourceType?: IAPISourceType;
  aipSourceTypeId?: number;
  aipUserName?: string;
}


export interface IAPISourceType extends IBaseApiResponse {
  aipSourceTypeId: number;
  name: string;
  label?:string
}
