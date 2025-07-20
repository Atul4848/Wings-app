import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIVaccinationIssuedCountry, IAPIVaccinationRequirement } from '../Interfaces';
import { CountryModel } from '@wings/shared';

@modelProtection
export class VaccinationRequirementModel extends CoreModel implements ISelectOption {
  healthAuthorizationId: number;
  paxCrew: SettingsTypeModel;
  vaccinationType: SettingsTypeModel;
  leadTime: number = null;
  age: number = null;
  additionalInformation: string = '';
  isVaccinationRequired: boolean = null;
  isBoosterRequired: boolean = null;
  isAgeExemption: boolean = null;
  expirationDays: number = null;
  isDocumentationRequired: boolean = null;
  documentationRequirements: string = '';
  vaccinationRequirementIssuedCountries: CountryModel[] = [];
  vaccinePrivileges: SettingsTypeModel[] = [];
  vaccineManufacturers: SettingsTypeModel[] = [];
  isInherited: boolean = false;
  boosterVaccineExpiration: number = null;
  vaccineBoosterManufacturers: SettingsTypeModel[] = [];
  isBoosterExpiry: boolean = false;
  boosterExemptions: string = '';

  constructor(data?: Partial<VaccinationRequirementModel>) {
    super(data);
    Object.assign(this, data);
    this.vaccinationRequirementIssuedCountries =
      data?.vaccinationRequirementIssuedCountries?.map(x => new CountryModel(x)) || [];
    this.vaccinePrivileges = data?.vaccinePrivileges?.map(x => new SettingsTypeModel(x)) || [];
    this.vaccineManufacturers = data?.vaccineManufacturers?.map(x => new SettingsTypeModel(x)) || [];
    this.paxCrew = new SettingsTypeModel(data?.paxCrew);
    this.vaccinationType = new SettingsTypeModel(data?.vaccinationType);
  }

  static deserialize(apiData: IAPIVaccinationRequirement): VaccinationRequirementModel {
    if (!apiData) {
      return new VaccinationRequirementModel();
    }
    const data: Partial<VaccinationRequirementModel> = {
      ...apiData,
      vaccinationType: SettingsTypeModel.deserialize({
        ...apiData.vaccinationType,
        id: apiData.vaccinationType?.vaccinationTypeId,
      }),
      paxCrew: SettingsTypeModel.deserialize({
        ...apiData.paxCrew,
        id: apiData.paxCrew.id || apiData.paxCrew.paxCrewId,
      }),
      vaccinationRequirementIssuedCountries: apiData.vaccinationRequirementIssuedCountries?.map(
        c =>
          new CountryModel({
            id: c.issuedCountryId,
            isO2Code: c.issuedCountryCode,
          })
      ),
      vaccinePrivileges: apiData.vaccinePrivileges?.map(x =>
        SettingsTypeModel.deserialize({ ...x, id: x.vaccinationPrivilegeId })
      ),
      vaccineManufacturers: apiData.vaccineManufacturers?.map(x =>
        SettingsTypeModel.deserialize({ ...x, id: x.vaccineManufacturerId })
      ),
      vaccineBoosterManufacturers: apiData.vaccineBoosterManufacturers?.map(x =>
        SettingsTypeModel.deserialize({ ...x, id: x.vaccineManufacturerId })
      ),
    };
    return new VaccinationRequirementModel(data);
  }

  public serialize(): IAPIVaccinationRequirement {
    return {
      healthAuthorizationId: this.healthAuthorizationId,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
      id: this.id,
      paxCrewId: this.paxCrew?.id,
      vaccinationTypeId: this.vaccinationType?.id,
      leadTime: Utilities.getNumberOrNullValue(this.leadTime),
      age: this.isAgeExemption ? this.age : null,
      additionalInformation: this.additionalInformation,
      isVaccinationRequired: this.isVaccinationRequired,
      isBoosterRequired: this.isBoosterRequired,
      isAgeExemption: this.isAgeExemption,
      isDocumentationRequired: this.isDocumentationRequired,
      documentationRequirements: this.isDocumentationRequired ? this.documentationRequirements : '',
      expirationDays: Utilities.getNumberOrNullValue(this.expirationDays),
      vaccinationRequirementIssuedCountries: this.getVaccinationIssuedCountries(),
      vaccinePrivilegeIds: this.vaccinePrivileges?.map(x => x.id) || [],
      vaccineManufacturerIds: this.vaccineManufacturers?.map(x => x.id) || [],
      isInherited: this.isInherited,
      boosterVaccineExpiration:
        this.isBoosterExpiry && this.isBoosterRequired
          ? Utilities.getNumberOrNullValue(this.boosterVaccineExpiration)
          : null,
      vaccineBoosterManufacturerIds: this.isBoosterRequired ? this.vaccineBoosterManufacturers?.map(x => x.id) : [],
      isBoosterExpiry: this.isBoosterRequired ? this.isBoosterExpiry : null,
      boosterExemptions: this.isBoosterRequired ? this.boosterExemptions : null,
    };
  }

  private getVaccinationIssuedCountries(): IAPIVaccinationIssuedCountry[] {
    return (
      this.vaccinationRequirementIssuedCountries?.map(x => ({
        ...x.serialize(),
        healthAuthorizationid: this.healthAuthorizationId,
        issuedCountryId: x.id,
        issuedCountryCode: x.isO2Code,
      })) || []
    );
  }

  static deserializeList(apiDataList: IAPIVaccinationRequirement[]): VaccinationRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIVaccinationRequirement) => VaccinationRequirementModel.deserialize(apiData))
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
