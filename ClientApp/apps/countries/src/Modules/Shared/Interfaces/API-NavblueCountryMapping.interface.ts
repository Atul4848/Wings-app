import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry } from '@wings/shared';

export interface IAPINavblueCountryMapping extends IBaseApiResponse {
  navBlueCountryCodes: IAPINavBlue[];
  country?: IAPICountry;
  countryId?: number;
}
export interface IAPINavBlue extends IBaseApiResponse {
  code: string;
}
