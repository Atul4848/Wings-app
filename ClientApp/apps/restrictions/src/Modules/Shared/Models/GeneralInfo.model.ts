import { CountryModel } from '@wings/shared';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  regex,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  SettingsTypeModel,
} from '@wings-shared/core';
import { HealthAuthorizationLinkModel, HealthAuthorizationNOTAMModel } from './index';
import { IApiGeneralInfo, IAPIHealthAuthorizationTraveledCountry } from '../Interfaces';
import { FLIGHT_ALLOWED } from '../Enums';

@modelProtection
export class GeneralInfoModel extends CoreModel implements ISelectOption {
  usCrewPaxInfo: string = '';
  nonUSCrewPaxInfo: string = '';
  generalInfo: string = '';
  flightsAllowed: SettingsTypeModel[] = [];
  activeDutyCrewDefinition: string = '';
  crewSwapOnlyLegDetails: string = '';
  disinsectionSprayRequirements: string = '';
  businessExemptions: string = '';
  serviceRestrictions: string = '';
  otherInformation: string = '';
  isBusinessExemption: boolean = null;
  isEssentialWorkersAllowed: boolean = null;
  isTechStopAllowed: boolean = null;
  isAircraftDisinfectionRequired: boolean = null;
  isFuelStopAllowed: boolean = null;
  isDisinsectionRequired: boolean = null;
  isTopOfDescentSprayRequired: boolean = null;
  isDocumentationRequired: boolean = null;
  whoCanLeaveAircraft: SettingsTypeModel = null;
  disembarkationType: number = 0;
  isCTSAccepted: boolean = null;
  healthAuthorizationLinks: HealthAuthorizationLinkModel[];
  healthAuthorizationNOTAMs: HealthAuthorizationNOTAMModel[];
  healthAuthorizationBannedTraveledCountries: CountryModel[] = [];
  isInherited: boolean = false;

  constructor(data?: Partial<GeneralInfoModel>) {
    super(data);
    Object.assign(this, data);
    this.healthAuthorizationLinks = data?.healthAuthorizationLinks?.map(a => new HealthAuthorizationLinkModel(a)) || [];
    this.healthAuthorizationNOTAMs =
      data?.healthAuthorizationNOTAMs?.map(a => new HealthAuthorizationNOTAMModel(a)) || [];
    this.healthAuthorizationBannedTraveledCountries =
      data?.healthAuthorizationBannedTraveledCountries?.map(x => new CountryModel(x)) || [];
  }

  static deserialize(apiData: IApiGeneralInfo): GeneralInfoModel {
    if (!apiData) {
      return new GeneralInfoModel();
    }
    const data: Partial<GeneralInfoModel> = {
      ...apiData,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      whoCanLeaveAircraft: SettingsTypeModel.deserialize({
        ...apiData.whoCanLeaveAircraft,
        id: apiData.whoCanLeaveAircraft?.whoCanLeaveAircraftId,
      }),
      flightsAllowed: this.getFlightsAllowed(apiData),
      healthAuthorizationLinks: HealthAuthorizationLinkModel.deserializeList(apiData.healthAuthorizationLinks),
      healthAuthorizationNOTAMs: HealthAuthorizationNOTAMModel.deserializeList(apiData.healthAuthorizationNOTAMs),
      healthAuthorizationBannedTraveledCountries: apiData.healthAuthorizationBannedTraveledCountries?.map(
        x =>
          new CountryModel({
            id: x.countryId || x.bannedTraveledCountryId,
            isO2Code: x.code || x.bannedTraveledCountryCode,
          })
      ),
    };
    return new GeneralInfoModel(data);
  }

  public serialize(): IApiGeneralInfo {
    return {
      id: this.id,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id || 1,
      usCrewPaxInfo: this.usCrewPaxInfo?.replace(regex.stripedHTML, '').trim() ? this.usCrewPaxInfo : null,
      nonUSCrewPaxInfo: this.nonUSCrewPaxInfo?.replace(regex.stripedHTML, '').trim() ? this.nonUSCrewPaxInfo : null,
      generalInfo: this.generalInfo?.replace(regex.stripedHTML, '').trim() ? this.generalInfo : null,
      flightsAllowedIds: this.getFlightsAllowedIds(),
      activeDutyCrewDefinition: this.activeDutyCrewDefinition,
      crewSwapOnlyLegDetails: this.crewSwapOnlyLegDetails,
      isBusinessExemption: this.isBusinessExemption,
      businessExemptions: this.businessExemptions,
      isEssentialWorkersAllowed: this.isEssentialWorkersAllowed,
      isTechStopAllowed: this.isTechStopAllowed,
      isFuelStopAllowed: this.isFuelStopAllowed,
      disembarkationType: this.disembarkationType,
      serviceRestrictions: this.serviceRestrictions,
      isAllFlightsAllowed: this.isallFlights(),
      isNoFlightsAllowed: this.isNoFlight(),
      whoCanLeaveAircraftId: this.whoCanLeaveAircraft?.id || 4,
      disinsectionSprayRequirements: this.disinsectionSprayRequirements,
      isDocumentationRequired: this.isDocumentationRequired,
      isTopOfDescentSprayRequired: this.isTopOfDescentSprayRequired,
      isAircraftDisinfectionRequired: this.isAircraftDisinfectionRequired,
      isDisinsectionRequired: this.isDisinsectionRequired,
      isCTSAccepted: this.isCTSAccepted,
      otherInformation: this.otherInformation,
      healthAuthorizationLinks: this.healthAuthorizationLinks?.map(x => x.serialize()) || [],
      healthAuthorizationNOTAMs: this.healthAuthorizationNOTAMs?.map(x => x.serialize()) || [],
      healthAuthorizationBannedTraveledCountries: this.getBannedTravelCountries(),
      isInherited: this.isInherited,
    };
  }

  private getBannedTravelCountries(): IAPIHealthAuthorizationTraveledCountry[] {
    return this.healthAuthorizationBannedTraveledCountries?.map(x => ({
      bannedTraveledCountryId: x.id,
      bannedTraveledCountryCode: x.isO2Code,
    }));
  }

  static getFlightsAllowed(apiData: IApiGeneralInfo): SettingsTypeModel[] {
    if (apiData.isAllFlightsAllowed) {
      return [ new SettingsTypeModel({ id: Utilities.getTempId(true), name: FLIGHT_ALLOWED.ALL_FLIGHT }) ];
    }
    if (apiData.isNoFlightsAllowed) {
      return [ new SettingsTypeModel({ id: Utilities.getTempId(true), name: FLIGHT_ALLOWED.NO_FLIGHT }) ];
    }
    return apiData.flightsAllowed?.map(x => SettingsTypeModel.deserialize({ ...x, id: x.flightsAllowedId }));
  }

  private isallFlights(): boolean {
    return this.flightsAllowed.some(x => x.name === FLIGHT_ALLOWED.ALL_FLIGHT);
  }

  private isNoFlight(): boolean {
    return this.flightsAllowed.some(x => x.name === FLIGHT_ALLOWED.NO_FLIGHT);
  }

  private getFlightsAllowedIds(): number[] {
    if (this.isallFlights() || this.isNoFlight()) {
      return [];
    }
    return this.flightsAllowed.map(x => x.id);
  }

  static deserializeList(apiDataList: IApiGeneralInfo[]): GeneralInfoModel[] {
    return apiDataList ? apiDataList.map((apiData: IApiGeneralInfo) => GeneralInfoModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
