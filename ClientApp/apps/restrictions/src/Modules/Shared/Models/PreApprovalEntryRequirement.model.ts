import { CoreModel, ISelectOption, modelProtection, Utilities } from '@wings-shared/core';
import { IAPIPreApprovalEntryRequirement } from '../Interfaces';

@modelProtection
export class PreApprovalEntryRequirementModel extends CoreModel implements ISelectOption {
  id: number = 0;
  leadTime: number = null;
  landingPermitImplications: string = '';

  constructor(data?: Partial<PreApprovalEntryRequirementModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIPreApprovalEntryRequirement): PreApprovalEntryRequirementModel {
    if (!apiData) {
      return new PreApprovalEntryRequirementModel();
    }
    const data: Partial<PreApprovalEntryRequirementModel> = {
      ...apiData,
      id: apiData.preApprovalEntryRequirementId,
    };
    return new PreApprovalEntryRequirementModel(data);
  }

  public serialize(): IAPIPreApprovalEntryRequirement {
    return {
      id: this.id,
      leadTime: Utilities.getNumberOrNullValue(this.leadTime),
      landingPermitImplications: this.landingPermitImplications,
    };
  }

  static deserializeList(apiDataList: IAPIPreApprovalEntryRequirement[]): PreApprovalEntryRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPreApprovalEntryRequirement) =>
        PreApprovalEntryRequirementModel.deserialize(apiData)
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
