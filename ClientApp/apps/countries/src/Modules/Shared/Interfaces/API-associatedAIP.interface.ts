import { IAPICountry } from '@wings/shared';
import { IAPIAeronauticalInformationPublication } from './API-aeronauticalInformationPublication.interface';
import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAssociatedAIP extends IBaseApiResponse {
  id: number;
  aeronauticalInformationPublication: IAPIAeronauticalInformationPublication;
  country: IAPICountry;
}

export interface IAPIAssociatedAipRequest extends IBaseApiResponse {
  aeronauticalInformationPublicationId: number;
  countryId: number;
  id:number;
}
