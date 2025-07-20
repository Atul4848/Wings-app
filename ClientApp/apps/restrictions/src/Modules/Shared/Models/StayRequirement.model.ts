import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIStayRequirement, IHotelAllowed, ITestFrequency } from '../Interfaces';

@modelProtection
export class StayRequirementModel extends CoreModel implements ISelectOption {
  healthAuthorizationId: number = 0;
  paxCrewId: number = 0;
  paxCrew: SettingsTypeModel;
  isStayRequired: boolean = null;
  stayLength: number = null;
  isVaccineExemption: boolean = null;
  isGovernmentHealthCheckRequired: boolean = null;
  isTestRequired: boolean = null;
  isLengthOfStay: boolean = true;
  testTypeId: number = 0;
  testType: SettingsTypeModel;
  testVendorAllowed: string;
  isSpecificHotelsOnly: boolean = null;
  isCrewDesignationChange: boolean = null;
  crewDesignationChangeLengthOfStay: number = 0;
  extraInformation: string;
  hotelsAllowed: SettingsTypeModel[];
  hotelsAllowedName: string[] = [];
  testFrequencies: SettingsTypeModel[];
  testFrequenciesName: string[] = [];
  stayLengthCategory: SettingsTypeModel;
  isInherited: boolean = false;
  testFrequency: string = '';

  constructor(data?: Partial<StayRequirementModel>) {
    super(data);
    Object.assign(this, data);
    this.paxCrew = new SettingsTypeModel(data?.paxCrew);
    this.testType = new SettingsTypeModel(data?.testType);
    this.hotelsAllowed = data?.hotelsAllowed?.map(a => new SettingsTypeModel(a)) || [];
    this.testFrequencies = data?.testFrequencies?.map(a => new SettingsTypeModel(a)) || [];
    this.stayLengthCategory = new SettingsTypeModel(data?.stayLengthCategory);
  }

  static deserialize(apiData: IAPIStayRequirement): StayRequirementModel {
    if (!apiData) {
      return new StayRequirementModel();
    }
    const data: Partial<StayRequirementModel> = {
      ...apiData,
      paxCrew: SettingsTypeModel.deserialize({
        ...apiData.paxCrew,
        id: apiData.paxCrew.id || apiData.paxCrew.paxCrewId,
      }),
      testType: SettingsTypeModel.deserialize({ ...apiData.testType, id: apiData.testType?.testTypeId }),
      hotelsAllowed:
        apiData.hotelsAllowed?.map(a => SettingsTypeModel.deserialize({ ...a, id: a.hotelsAllowedId })) || [],
      hotelsAllowedName: apiData.hotelsAllowed?.map(a => a.name),
      testFrequencies: apiData.testFrequencies?.map(a =>
        SettingsTypeModel.deserialize({ ...a, id: a.testFrequencyId, name: a.interval.toString() })
      ),
      testFrequenciesName: apiData.testFrequencies?.map(a => a.interval.toString()) || [],
      stayLengthCategory: SettingsTypeModel.deserialize({
        ...apiData.stayLengthCategory,
        id: apiData.stayLengthCategory?.stayLengthCategoryId,
      }),
    };
    return new StayRequirementModel(data);
  }

  public serialize(): IAPIStayRequirement {
    if (!this.isStayRequired) {
      return {
        id: this.id,
        paxCrewId: this.paxCrew.id,
        isStayRequired: this.isStayRequired,
        isInherited: this.isInherited,
      };
    }
    return {
      id: this.id,
      paxCrewId: this.paxCrew.id,
      isStayRequired: this.isStayRequired,
      stayLength: Utilities.getNumberOrNullValue(this.stayLength),
      isVaccineExemption: this.isVaccineExemption,
      isGovernmentHealthCheckRequired: this.isGovernmentHealthCheckRequired,
      isTestRequired: this.isTestRequired,
      testTypeId: this.isTestRequired ? this.testType.id : null,
      testVendorAllowed: this.testVendorAllowed,
      isSpecificHotelsOnly: this.isSpecificHotelsOnly,
      isCrewDesignationChange: this.isCrewDesignationChange,
      isLengthOfStay: this.isLengthOfStay,
      crewDesignationChangeLengthOfStay: this.isCrewDesignationChange
        ? Utilities.getNumberOrNullValue(this.crewDesignationChangeLengthOfStay)
        : null,
      extraInformation: this.extraInformation,
      hotelsAllowed: this.isSpecificHotelsOnly ? this.gethotelsAllowed() : [],
      testFrequencies: this.isTestRequired ? this.getTestFrequencies() : [],
      stayLengthCategoryId: this.isStayRequired ? this.stayLengthCategory?.id : null,
      isInherited: this.isInherited,
      testFrequency: this.testFrequency,
    };
  }

  private gethotelsAllowed(): IHotelAllowed[] {
    return this.hotelsAllowedName
      ?.filter(name => name.trim().length)
      .map(name => {
        const index = this.hotelsAllowed.findIndex(reg => Utilities.isEqual(reg.name, name));
        if (index > -1) {
          return this.hotelsAllowed[index].serialize();
        }
        return new SettingsTypeModel({ name, id: 0 }).serialize();
      });
  }

  private getTestFrequencies(): ITestFrequency[] {
    return this.testFrequenciesName?.map(interval => {
      const index = this.testFrequencies.findIndex(reg => Utilities.isEqual(reg.name, interval));
      if (index > -1) {
        return { id: this.testFrequencies[index].id, interval: Number(interval) };
      }
      return { id: 0, interval: Number(interval) };
    });
  }

  static deserializeList(apiDataList: IAPIStayRequirement[]): StayRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIStayRequirement) => StayRequirementModel.deserialize(apiData))
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
