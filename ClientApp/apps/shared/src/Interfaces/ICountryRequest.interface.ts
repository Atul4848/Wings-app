import { IBaseApiResponse } from '@wings-shared/core';

export interface ICountryRequest extends IBaseApiResponse {
  startDate: string;
  endDate: string;
  officialName: string;
  commonName: string;
  isO2Code: string;
  isO3Code: string;
  continentId: number;
  capitalCityId: number;
  isTerritory: boolean;
  territoryTypeId: number;
  sovereignCountryId: number;
  isoNumericCode: string;
  cappsCountryName: string;
  cappsTerritoryTypeId: number;
  cappsShortDescription: string;
  postalCodeFormat: boolean;
  currencyCode: string;
  commsPrefix: string;
  cappsusSanction: boolean;
  cappsusSanctionType: string;
  cappsRegistryIdentifier: string;
  securityThreatLevel: number;
  regions: IRegionRequest[];
}

interface IRegionRequest {
  regionId: number;
  regionName: string;
  regionTypeId: number;
  regionTypeName: string;
}
