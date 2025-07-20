import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIBoardingType, IAPIExitRequirement, ITestFrequency } from '../Interfaces';
import { ExitFormRequirementModel } from './ExitFormRequirement.model';

@modelProtection
export class ExitRequirementModel extends CoreModel implements ISelectOption {
  healthAuthorizationId: number;
  paxCrewId: number = 0;
  isExitRequirement: boolean = null;
  isSymptomBased: boolean = null;
  isFormsRequired: boolean = null;
  isPreDepartureTestRequired: boolean = null;
  isVaccineExemption: boolean = null;
  isArrivalTestVaccineExemption: boolean = null;
  isPreDepartureTestVaccineExemption: boolean = null;
  isProofToBoard: boolean = null;
  consequences: string;
  leadTime: number = 0;
  extraInformation: string;
  paxCrew: SettingsTypeModel;
  testType: SettingsTypeModel;
  boardingTypes: SettingsTypeModel[] = [];
  testFrequencies: SettingsTypeModel[];
  testFrequenciesName: string[] = [];
  formRequirements: ExitFormRequirementModel[];
  isInherited: boolean = false;

  constructor(data?: Partial<ExitRequirementModel>) {
    super(data);
    Object.assign(this, data);
    this.testType = data?.testType?.id ? new SettingsTypeModel(data.testType) : null;
    this.paxCrew = new SettingsTypeModel(data.paxCrew);
    this.boardingTypes = data?.boardingTypes?.map(x => new SettingsTypeModel(x)) || [];
    this.testFrequencies = data?.testFrequencies?.map(a => new SettingsTypeModel(a)) || [];
    this.formRequirements = data?.formRequirements?.map(a => new ExitFormRequirementModel(a)) || [];
  }

  static deserialize(apiData: IAPIExitRequirement): ExitRequirementModel {
    if (!apiData) {
      return new ExitRequirementModel();
    }
    const data: Partial<ExitRequirementModel> = {
      ...apiData,
      formRequirements: ExitFormRequirementModel.deserializeList(apiData.exitFormsRequired),
      paxCrew: SettingsTypeModel.deserialize({
        ...apiData.paxCrew,
        id: apiData.paxCrew.id || apiData.paxCrew.paxCrewId,
      }),
      testType: SettingsTypeModel.deserialize({
        ...apiData.testType,
        id: apiData.testType?.testTypeId,
      }),
      boardingTypes:
        (apiData.boardingTypes &&
          (apiData.boardingTypes as IAPIBoardingType[])?.map(x =>
            SettingsTypeModel.deserialize({ ...x, id: x.boardingTypeId })
          )) ||
        [],
      testFrequencies: apiData.exitTestFrequencies?.map(a =>
        SettingsTypeModel.deserialize({ id: a.exitTestFrequencyId, name: a.interval.toString() })
      ),
      testFrequenciesName: apiData.exitTestFrequencies?.map(a => a.interval.toString()) || [],
    };
    return new ExitRequirementModel(data);
  }

  public serialize(): IAPIExitRequirement {
    if (!this.isExitRequirement) {
      return {
        id: this.id,
        paxCrewId: this.paxCrew.id,
        isExitRequirement: this.isExitRequirement,
        isInherited: this.isInherited,
      };
    }
    return {
      id: this.id,
      paxCrewId: this.paxCrew.id,
      isExitRequirement: this.isExitRequirement,
      isSymptomBased: this.isSymptomBased,
      isFormsRequired: this.isFormsRequired,
      isPreDepartureTestRequired: this.isPreDepartureTestRequired,
      testTypeId: this.isPreDepartureTestRequired ? this.testType.id : null,
      isArrivalTestVaccineExemption: this.isArrivalTestVaccineExemption,
      isPreDepartureTestVaccineExemption: this.isPreDepartureTestVaccineExemption,
      isProofToBoard: this.isProofToBoard,
      consequences: this.consequences,
      leadTime: Utilities.getNumberOrNullValue(this.leadTime),
      extraInformation: this.extraInformation,
      boardingTypes: this.isProofToBoard ? (this.boardingTypes?.map(x => x.id) as number[]) : [],
      exitTestFrequencies: this.isPreDepartureTestRequired ? this.getTestFrequencies() : [],
      exitFormsRequired: this.isFormsRequired ? this.formRequirements.map(a => a.serialize()) : [],
      isInherited: this.isInherited,
    };
  }

  static deserializeList(apiDataList: IAPIExitRequirement[]): ExitRequirementModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => ExitRequirementModel.deserialize(apiData)) : [];
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

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
