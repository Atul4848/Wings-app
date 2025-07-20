import { IBaseApiResponse } from '@wings-shared/core';
import { THREAT_LEVEL } from '@wings-shared/threat-level';
import {
  IAPISovereignCountry,
  IAPIRegion,
  IAPIContinent,
  IAPICAPPSTerritoryType,
  IAPICity,
  IAPICabotage,
  IAPICustom,
  IAPIGeneral,
  IAPIFlightPlanning,
} from './index';

export interface IAPICountry extends IBaseApiResponse {
  officialName: string;
  countryName: string;
  commonName: string;
  code: string;
  isO2Code: string;
  iso2Code?: string;
  isO3Code: string;
  iso3Code?: string;
  isoNumericCode: string;
  capitalCityId?: number;
  isTerritory: boolean;
  territoryTypeId?: number;
  sovereignCountryId?: number;
  startDate?: string;
  endDate?: string;
  countryId: number;
  cappsCountryName: string;
  cappsTerritoryTypeId?: number;
  cappsShortDescription: string;
  cappsRegistryIdentifier: string;
  cappsCreatedOn?: string;
  cappsModifiedOn?: string;
  postalCodeFormat: boolean;
  currencyCode: string;
  commsPrefix: string;
  cappsusSanction: boolean;
  cappsusSanctionType: string;
  regionId: number;
  securityThreatLevel: THREAT_LEVEL;
  associatedRegions: IAPIRegion[];
  geographicalRegion: IAPIRegion;
  regions?: IAPIRegion[];
  continent: IAPIContinent;
  capitalCity: IAPICity;
  territoryType: IAPICAPPSTerritoryType;
  sovereignCountry: IAPISovereignCountry;
  cappsTerritoryType?: IAPICAPPSTerritoryType;
  customsOperationalRequirement?: IAPICustom;
  cabotageOperationalRequirement?: IAPICabotage;
  flightPlanningOperationalRequirement?: IAPIFlightPlanning;
  generalOperationalRequirement?: IAPIGeneral;
}
