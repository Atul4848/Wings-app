import { CountryModel } from '@wings/shared';
import {
  CoreModel,
  ISelectOption,
  modelProtection,
  Utilities,
  SettingsTypeModel,
  IdNameCodeModel,
} from '@wings-shared/core';
import {
  IAPIBannedNationalityRegion,
  IAPIEntryRequirement,
  IAPIHealthAuthorizationBannedNationality,
} from '../Interfaces';
import { ArrivalTestEntryRequirementModel } from './ArrivalTestEntryRequirement.model';
import { EntryFormRequirementModel } from './EntryFormRequirement.model';
import { PreApprovalEntryRequirementModel } from './PreApprovalEntryRequirement.model';
import { PreTravelTestEntryRequirementModel } from './PreTravelTestEntryRequirement.model';

@modelProtection
export class EntryRequirementModel extends CoreModel implements ISelectOption {
  paxCrew: SettingsTypeModel;
  healthAuthorizationId: number = 0;
  paxCrewId: number = 0;
  isEntryRequirements: boolean = null;
  isPreApprovalRequired: boolean = null;
  isPreTravelTestRequired: boolean = null;
  isTestRequiredOnArrival: boolean = null;
  isHealthScreeningOnArrival: boolean = null;
  isStayContactInfoRequired: boolean = null;
  isHotelPreBookingRequired: boolean = null;
  isRandomScreeningTestingPossible: boolean = null;
  isSymptomaticUponArrivalRequirements: boolean = null;
  isHealthInsuranceRequired: boolean = null;
  symptomaticUponArrivalRequirements: string = '';
  typeOfHealthInsuranceRequired: string = '';
  extraInformation: string = '';
  isFormsRequired: boolean = null;
  preApprovalEntryRequirement: PreApprovalEntryRequirementModel;
  preTravelTestEntryRequirement: PreTravelTestEntryRequirementModel;
  arrivalTestEntryRequirement: ArrivalTestEntryRequirementModel;
  formRequirements: EntryFormRequirementModel[] = [];
  ageExemption: number = null;
  covidRecoveredPassengerExemption: string = '';
  entryRequirementBannedNationalitiesRegions: IdNameCodeModel[];
  entryRequirementBannedNationalities: CountryModel[] = [];
  isInherited: boolean = false;

  constructor(data?: Partial<EntryRequirementModel>) {
    super(data);
    Object.assign(this, data);
    this.preApprovalEntryRequirement = new PreApprovalEntryRequirementModel(data?.preApprovalEntryRequirement);
    this.preTravelTestEntryRequirement = new PreTravelTestEntryRequirementModel(data?.preTravelTestEntryRequirement);
    this.arrivalTestEntryRequirement = new ArrivalTestEntryRequirementModel(data?.arrivalTestEntryRequirement);
    this.formRequirements = data?.formRequirements?.map(a => new EntryFormRequirementModel(a)) || [];
    this.entryRequirementBannedNationalities =
      data?.entryRequirementBannedNationalities?.map(x => new CountryModel(x)) || [];
    this.entryRequirementBannedNationalitiesRegions =
      data?.entryRequirementBannedNationalitiesRegions?.map(x => new IdNameCodeModel(x)) || [];
  }

  static deserialize(apiData: IAPIEntryRequirement): EntryRequirementModel {
    if (!apiData) {
      return new EntryRequirementModel();
    }
    const data: Partial<EntryRequirementModel> = {
      ...apiData,
      id: apiData.entryRequirementId,
      isSymptomaticUponArrivalRequirements: Boolean(apiData.symptomaticUponArrivalRequirements),
      preTravelTestEntryRequirement: PreTravelTestEntryRequirementModel.deserialize(
        apiData.preTravelTestEntryRequirement
      ),
      arrivalTestEntryRequirement: ArrivalTestEntryRequirementModel.deserialize(apiData.arrivalTestEntryRequirement),
      preApprovalEntryRequirement: PreApprovalEntryRequirementModel.deserialize(apiData.preApprovalEntryRequirement),
      formRequirements: EntryFormRequirementModel.deserializeList(apiData?.formRequirements),
      paxCrew: SettingsTypeModel.deserialize({
        ...apiData.paxCrew,
        id: apiData.paxCrew.id || apiData.paxCrew.paxCrewId,
      }),
      entryRequirementBannedNationalitiesRegions: apiData.entryRequirementBannedNationalityRegions?.map(
        x =>
          new IdNameCodeModel({
            id: x.region?.regionId || x.region?.id,
            name: x.region?.name,
            code: x.region?.code,
          })
      ),
      entryRequirementBannedNationalities: apiData.entryRequirementBannedNationalities?.map(
        x =>
          new CountryModel({
            id: x.countryId || x.bannedNationalityCountryId,
            isO2Code: x.code || x.bannedNationalityCountryCode,
            name: x.name,
          })
      ),
    };
    return new EntryRequirementModel(data);
  }

  public serialize(): IAPIEntryRequirement {
    if (!this.isEntryRequirements) {
      return {
        id: this.id,
        isEntryRequirements: this.isEntryRequirements,
        entryRequirementId: this.id,
        paxCrewId: this.paxCrew?.id,
        isInherited: this.isInherited,
      };
    }
    return {
      id: this.id,
      entryRequirementId: this.id,
      paxCrewId: this.paxCrew?.id,
      extraInformation: this.extraInformation,
      isFormsRequired: this.isFormsRequired,
      formRequirements: this.isFormsRequired ? this.formRequirements.map(a => a.serialize()) : [],
      isEntryRequirements: this.isEntryRequirements,
      isHealthInsuranceRequired: this.isHealthInsuranceRequired,
      isHealthScreeningOnArrival: this.isHealthScreeningOnArrival,
      isHotelPreBookingRequired: this.isHotelPreBookingRequired,
      isPreApprovalRequired: this.isPreApprovalRequired,
      isPreTravelTestRequired: this.isPreTravelTestRequired,
      isRandomScreeningTestingPossible: this.isRandomScreeningTestingPossible,
      isStayContactInfoRequired: this.isStayContactInfoRequired,
      isTestRequiredOnArrival: this.isTestRequiredOnArrival,
      symptomaticUponArrivalRequirements: this.isSymptomaticUponArrivalRequirements
        ? this.symptomaticUponArrivalRequirements
        : null,
      preApprovalEntryRequirement:
        this.isPreApprovalRequired && this.preApprovalEntryRequirement
          ? this.preApprovalEntryRequirement.serialize()
          : null,
      preTravelTestEntryRequirement:
        this.isPreTravelTestRequired && this.preTravelTestEntryRequirement
          ? this.preTravelTestEntryRequirement.serialize()
          : null,
      typeOfHealthInsuranceRequired: this.isHealthInsuranceRequired ? this.typeOfHealthInsuranceRequired : null,
      arrivalTestEntryRequirement:
        this.isTestRequiredOnArrival && this.arrivalTestEntryRequirement
          ? this.arrivalTestEntryRequirement.serialize()
          : null,
      ageExemption: Utilities.getNumberOrNullValue(this.ageExemption),
      covidRecoveredPassengerExemption: this.covidRecoveredPassengerExemption,
      entryRequirementBannedNationalities: this.getBannedNationalities(),
      entryRequirementBannedNationalityRegions: this.getBannedNationalityRegions(),
      isInherited: this.isInherited,
    };
  }

  private getBannedNationalities(): IAPIHealthAuthorizationBannedNationality[] {
    return this.entryRequirementBannedNationalities?.map(x => ({
      bannedNationalityCountryId: x.id,
      bannedNationalityCountryCode: x.isO2Code,
    }));
  }

  private getBannedNationalityRegions(): IAPIBannedNationalityRegion[] {
    return this.entryRequirementBannedNationalitiesRegions?.map(x => ({
      regionId: x.id,
      name: x.name,
      code: x.code,
    }));
  }

  static deserializeList(apiDataList: IAPIEntryRequirement[]): EntryRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIEntryRequirement) => EntryRequirementModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
