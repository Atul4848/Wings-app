import {
  RegionModel,
  CAPPSTerritoryTypeModel,
  SovereignCountryModel,
  ContinentModel,
  CabotageModel,
  CustomModel,
  GeneralModel,
  FlightPlanningModel,
} from '../Models';
import { IAPICountry, ICountryRequest } from '../Interfaces';
import { THREAT_LEVEL } from '@wings-shared/threat-level';
import { BaseCityModel } from './BaseCity.model';
import {
  modelProtection,
  Utilities,
  DATE_FORMAT,
  SourceTypeModel,
  CoreModel,
  StatusTypeModel,
  AccessLevelModel,
  ISelectOption,
  SelectOption,
} from '@wings-shared/core';

@modelProtection
export class CountryModel extends CoreModel implements ISelectOption {
  officialName: string = '';
  commonName: string = '';
  isO2Code: string = '';
  code: string = '';
  isO3Code: string = '';
  isoNumericCode: string = '';
  isTerritory: boolean = false;
  startDate?: string = null;
  endDate?: string = null;
  countryId: number = null;
  cappsCountryName: string = '';
  cappsShortDescription: string = '';
  cappsRegistryIdentifier: string = '';
  postalCodeFormat: boolean = false;
  currencyCode: string = '';
  commsPrefix: SelectOption | string;
  cappsusSanction: boolean = false;
  cappsusSanctionType: string = '';
  securityThreatLevel: THREAT_LEVEL = 0;
  // view models
  associatedRegions: RegionModel[] = [];
  territoryType?: CAPPSTerritoryTypeModel;
  continent?: ContinentModel;
  capitalCity?: BaseCityModel;
  geographicalRegion?: RegionModel;
  sovereignCountry?: SovereignCountryModel;
  cappsTerritoryType?: CAPPSTerritoryTypeModel;
  // required for restrictions
  nationalityId: number = 0;
  flightPlanningOperationalRequirement?: FlightPlanningModel;
  customsOperationalRequirement?: CustomModel;
  cabotageOperationalRequirement?: CabotageModel;
  cabotage?: CabotageModel;
  generalOperationalRequirement?: GeneralModel;

  constructor(data?: Partial<CountryModel>) {
    super(data);
    Object.assign(this, data);
    this.sourceType = data?.sourceType ? new SourceTypeModel(data?.sourceType) : null;
  }

  static deserialize(apiCountry: IAPICountry): CountryModel {
    if (!apiCountry) {
      return new CountryModel();
    }
    const data: Partial<CountryModel> = {
      ...apiCountry,
      ...CoreModel.deserializeAuditFields(apiCountry),
      id: apiCountry.countryId || apiCountry.id,
      officialName: apiCountry.countryName || apiCountry.name || apiCountry.officialName,
      commonName: apiCountry.commonName || apiCountry.countryName || apiCountry.name,
      isO2Code: apiCountry.iso2Code || apiCountry.isO2Code || apiCountry.code,
      code: apiCountry.code,
      isO3Code: apiCountry.iso3Code || apiCountry.isO3Code,
      isoNumericCode: apiCountry.isoNumericCode,
      isTerritory: apiCountry.isTerritory,
      startDate: Utilities.getformattedDate(apiCountry.startDate, DATE_FORMAT.API_DATE_FORMAT),
      endDate: Utilities.getformattedDate(apiCountry.endDate, DATE_FORMAT.API_DATE_FORMAT),
      countryId: apiCountry.countryId,
      cappsCountryName: apiCountry.cappsCountryName,
      cappsShortDescription: apiCountry.cappsShortDescription,
      cappsRegistryIdentifier: apiCountry.cappsRegistryIdentifier,
      postalCodeFormat: apiCountry.postalCodeFormat,
      currencyCode: apiCountry.currencyCode,
      commsPrefix: apiCountry.commsPrefix
        ? new SelectOption({ name: apiCountry.commsPrefix, value: apiCountry.commsPrefix })
        : '',
      cappsusSanction: apiCountry.cappsusSanction,
      cappsusSanctionType: apiCountry.cappsusSanctionType,
      securityThreatLevel: apiCountry.securityThreatLevel,
      // view models
      sovereignCountry: SovereignCountryModel.deserialize(apiCountry.sovereignCountry),
      territoryType: CAPPSTerritoryTypeModel.deserialize(apiCountry.territoryType),
      cappsTerritoryType: CAPPSTerritoryTypeModel.deserialize(apiCountry.cappsTerritoryType),
      capitalCity: BaseCityModel.deserialize(apiCountry.capitalCity),
      continent: ContinentModel.deserialize(apiCountry.continent),
      geographicalRegion: RegionModel.deserialize(apiCountry.geographicalRegion),
      associatedRegions: RegionModel.deserializeList(apiCountry.associatedRegions),
      status: StatusTypeModel.deserialize(apiCountry.status),
      accessLevel: AccessLevelModel.deserialize(apiCountry.accessLevel),
      sourceType: apiCountry.sourceType ? SourceTypeModel.deserialize(apiCountry.sourceType) : null,
      customsOperationalRequirement: apiCountry.customsOperationalRequirement
        ? CustomModel.deserialize(apiCountry.customsOperationalRequirement)
        : null,
      cabotageOperationalRequirement: apiCountry.cabotageOperationalRequirement
        ? CabotageModel.deserialize(apiCountry.cabotageOperationalRequirement)
        : null,
      flightPlanningOperationalRequirement: apiCountry.flightPlanningOperationalRequirement
        ? FlightPlanningModel.deserialize(apiCountry.flightPlanningOperationalRequirement)
        : null,
      generalOperationalRequirement: apiCountry.generalOperationalRequirement
        ? GeneralModel.deserialize(apiCountry.generalOperationalRequirement)
        : null,
    };
    return new CountryModel(data);
  }

  static deserializeList(apiPersonList: IAPICountry[]): CountryModel[] {
    return apiPersonList ? apiPersonList.map((apiPerson: IAPICountry) => CountryModel.deserialize(apiPerson)) : [];
  }

  public serialize(): ICountryRequest {
    const clonedObject: ICountryRequest = {
      id: this.id || 0,
      startDate: this.startDate ? this.startDate : null,
      endDate: this.endDate ? this.endDate : null,
      officialName: this.officialName,
      commonName: this.commonName,
      isO2Code: this.isO2Code,
      isO3Code: this.isO3Code,
      isTerritory: this.isTerritory,
      isoNumericCode: `${this.isoNumericCode}`,
      cappsCountryName: this.cappsCountryName,
      cappsTerritoryTypeId: this.cappsTerritoryType?.id,
      cappsShortDescription: this.cappsShortDescription,
      postalCodeFormat: this.postalCodeFormat,
      currencyCode: this.currencyCode,
      commsPrefix: (this.commsPrefix as SelectOption)?.label || '',
      cappsusSanction: this.cappsusSanction,
      cappsusSanctionType: this.cappsusSanctionType,
      cappsRegistryIdentifier: this.cappsRegistryIdentifier,
      securityThreatLevel: this.securityThreatLevel,
      territoryTypeId: this.territoryType?.id,
      sovereignCountryId: this.sovereignCountry?.id,
      continentId: this.continent?.id,
      capitalCityId: this.capitalCity?.id || null,
      sourceTypeId: this.sourceType?.id,
      accessLevelId: this.accessLevel?.id,
      statusId: this.status?.id,
      regions: [
        {
          regionId: this.geographicalRegion?.id,
          regionName: this.geographicalRegion?.name,
          regionTypeId: this.geographicalRegion?.regionType?.id,
          regionTypeName: this.geographicalRegion?.regionType?.name,
        },
      ],
    };

    return Utilities.trimEmptyValues<ICountryRequest>(clonedObject);
  }

  // required in auto complete
  public get label(): string {
    if (Boolean(this.commonName) && Boolean(this.isO2Code)) {
      return `${this.commonName} ${`(${this.isO2Code})`}`;
    }

    return Boolean(this.commonName) && !Boolean(this.isO2Code) ? this.commonName : this.isO2Code;
  }

  public get value(): string | number {
    return this.id;
  }
}
