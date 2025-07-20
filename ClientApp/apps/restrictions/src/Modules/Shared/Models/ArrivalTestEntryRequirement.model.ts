import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIArrivalTestEntryRequirement } from '../Interfaces';

@modelProtection
export class ArrivalTestEntryRequirementModel extends CoreModel implements ISelectOption {
  id: number = 0;
  isArrivalTestVaccineExemption: boolean = false;
  arrivalTestEntryRequirementId: number = 0;

  constructor(data?: Partial<ArrivalTestEntryRequirementModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIArrivalTestEntryRequirement): ArrivalTestEntryRequirementModel {
    if (!apiData) {
      return new ArrivalTestEntryRequirementModel();
    }
    const data: Partial<ArrivalTestEntryRequirementModel> = {
      ...apiData,
      id: apiData.arrivalTestEntryRequirementId,
    };
    return new ArrivalTestEntryRequirementModel(data);
  }

  public serialize(): IAPIArrivalTestEntryRequirement {
    return {
      id: this.id,
      arrivalTestEntryRequirementId: this.arrivalTestEntryRequirementId,
    };
  }

  static deserializeList(apiDataList: IAPIArrivalTestEntryRequirement[]): ArrivalTestEntryRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIArrivalTestEntryRequirement) =>
        ArrivalTestEntryRequirementModel.deserialize(apiData)
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
