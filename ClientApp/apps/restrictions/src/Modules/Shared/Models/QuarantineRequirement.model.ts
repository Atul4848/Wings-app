import { CountryModel } from '@wings/shared';
import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIQuarantineRequirement, IAPIQuarantineTraveledCountrie } from '../Interfaces';

@modelProtection
export class QuarantineRequirementModel extends CoreModel implements ISelectOption {
  healthAuthorizationId: number = 0;
  quarantineRequirementId: number = 0;
  isQuarantineRequired: boolean = null;
  isSymptomsBased: boolean = null;
  isTravelHistoryBased: boolean = null;
  traveledCountries: string = '';
  previousTimeFrame: number = null;
  periodOfQuarantineRequired: number = null;
  isGovtSelfMonitoringRequired: boolean = null;
  monitoringMethod: string = '';
  isTestExemption: boolean = null;
  testModifications: string = '';
  testInformation: string = '';
  isVaccineExemption: boolean = false;
  extraInformation: string = '';
  isAgeExemption: boolean = null;
  age: number = null;
  isLocationAllowed: boolean = null;
  isPeriodOfQuarantineRequired: boolean = null;
  isLengthOfStay: boolean = true;
  paxCrew: SettingsTypeModel;
  quarantineLocations: SettingsTypeModel[] = [];
  quarantineTraveledCountries: CountryModel[] = [];
  isInherited: boolean = false;

  constructor(data?: Partial<QuarantineRequirementModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIQuarantineRequirement): QuarantineRequirementModel {
    if (!apiData) {
      return new QuarantineRequirementModel();
    }
    const data: Partial<QuarantineRequirementModel> = {
      ...apiData,
      isLocationAllowed: Boolean(apiData.quarantineLocations?.length),
      isPeriodOfQuarantineRequired: Boolean(apiData.periodOfQuarantineRequired),
      paxCrew: SettingsTypeModel.deserialize({
        ...apiData.paxCrew,
        id: apiData.paxCrew.id || apiData.paxCrew.paxCrewId,
      }),
      quarantineLocations: apiData.quarantineLocations.map(x =>
        SettingsTypeModel.deserialize({ ...x, id: x.quarantineLocationId })
      ),
      quarantineTraveledCountries: apiData.quarantineTraveledCountries.map(
        c =>
          new CountryModel({
            id: c.travelCountryId,
            isO2Code: c.travelCountryCode,
            name: c.name,
          })
      ),
    };
    return new QuarantineRequirementModel(data);
  }

  public serialize(): IAPIQuarantineRequirement {
    if (!this.isQuarantineRequired) {
      return {
        id: this.quarantineRequirementId,
        isQuarantineRequired: this.isQuarantineRequired,
        paxCrewId: this.paxCrew?.id,
        isInherited: this.isInherited,
      };
    }

    return {
      healthAuthorizationId: this.healthAuthorizationId,
      id: this.quarantineRequirementId,
      quarantineRequirementId: this.quarantineRequirementId,
      isQuarantineRequired: this.isQuarantineRequired,
      isSymptomsBased: this.isSymptomsBased,
      isTravelHistoryBased: this.isTravelHistoryBased,
      traveledCountries: this.traveledCountries,
      previousTimeFrame: this.isTravelHistoryBased ? Utilities.getNumberOrNullValue(this.previousTimeFrame) : null,
      periodOfQuarantineRequired: this.isPeriodOfQuarantineRequired
        ? Utilities.getNumberOrNullValue(this.periodOfQuarantineRequired)
        : null,
      isGovtSelfMonitoringRequired: this.isGovtSelfMonitoringRequired,
      monitoringMethod: this.isGovtSelfMonitoringRequired ? this.monitoringMethod : '',
      isTestExemption: this.isTestExemption,
      testModifications: this.testModifications,
      testInformation: this.isTestExemption ? this.testInformation : '',
      extraInformation: this.extraInformation,
      isAgeExemption: this.isAgeExemption,
      age: this.isAgeExemption ? Utilities.getNumberOrNullValue(this.age) : null,
      paxCrewId: this.paxCrew?.id,
      quarantineRequirementLocations: this.isLocationAllowed ? this.quarantineLocations?.map(x => x.id) : [],
      quarantineTraveledCountries: this.isTravelHistoryBased ? this.getTraveledCountries() : [],
      isLengthOfStay: this.isPeriodOfQuarantineRequired ? this.isLengthOfStay : false,
      isInherited: this.isInherited,
    };
  }

  static deserializeList(apiDataList: IAPIQuarantineRequirement[]): QuarantineRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIQuarantineRequirement) => QuarantineRequirementModel.deserialize(apiData))
      : [];
  }

  private getTraveledCountries(): IAPIQuarantineTraveledCountrie[] {
    return this.quarantineTraveledCountries?.map(x => ({
      ...x.serialize(),
      healthAuthorizationid: this.healthAuthorizationId,
      travelCountryId: x.id,
      travelCountryCode: x.isO2Code,
    }));
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
