import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPreTravelTestEntryRequirement } from '../Interfaces';
import { PreTravelTestDetailModel } from './PreTravelTestDetail.model';

@modelProtection
export class PreTravelTestEntryRequirementModel extends CoreModel implements ISelectOption {
  isPreTravelTestVaccineExemption: boolean = false;
  isProofRequiredBeforeBoarding: boolean = null;
  consequences: string = '';
  leadTime: number = null;
  leadTimeIndicatorId: number = null;
  testType: SettingsTypeModel;
  leadTimeIndicator: SettingsTypeModel;
  preTravelTestDetails: PreTravelTestDetailModel[];

  constructor(data?: Partial<PreTravelTestEntryRequirementModel>) {
    super(data);
    Object.assign(this, data);
    this.testType = data?.testType?.id ? new SettingsTypeModel(data.testType) : null;
    this.leadTimeIndicator = new SettingsTypeModel(data?.leadTimeIndicator);
  }

  static deserialize(apiData: IAPIPreTravelTestEntryRequirement): PreTravelTestEntryRequirementModel {
    if (!apiData) {
      return new PreTravelTestEntryRequirementModel();
    }
    const data: Partial<PreTravelTestEntryRequirementModel> = {
      ...apiData,
      testType: SettingsTypeModel.deserialize({
        ...apiData?.testType,
        id: apiData?.testType?.testTypeId || apiData?.testType?.id,
      }),
      leadTimeIndicator: SettingsTypeModel.deserialize({
        ...apiData?.leadTimeIndicator,
        id: apiData?.leadTimeIndicator?.leadTimeIndicatorId || apiData?.leadTimeIndicator?.id,
      }),
      preTravelTestDetails: PreTravelTestDetailModel.deserializeList(apiData.preTravelTestDetails),
    };
    return new PreTravelTestEntryRequirementModel(data);
  }

  public serialize(): IAPIPreTravelTestEntryRequirement {
    return {
      id: this.id,
      testTypeId: this.testType?.id || null,
      isProofRequiredBeforeBoarding: this.isProofRequiredBeforeBoarding,
      consequences: this.consequences,
      leadTime: Utilities.getNumberOrNullValue(this.leadTime),
      leadTimeIndicatorId: this.leadTimeIndicator?.id || null,
      preTravelTestDetails: this.preTravelTestDetails.map(x => x.serialize()),
    };
  }

  static deserializeList(apiDataList: IAPIPreTravelTestEntryRequirement[]): PreTravelTestEntryRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPreTravelTestEntryRequirement) =>
        PreTravelTestEntryRequirementModel.deserialize(apiData)
      )
      : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
