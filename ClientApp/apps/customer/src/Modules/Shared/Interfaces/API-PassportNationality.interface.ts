import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry } from '@wings/shared';

export interface IAPIPassportNationality extends IBaseApiResponse {
  passportNationalityCode: string;
  countryId?: number;
  countryCode?: string;
  countryName?: string;
  description: string;
}
