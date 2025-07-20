import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIConditionType } from '../Interfaces';

@modelProtection
export class ConditionTypeModel extends CoreModel implements ISelectOption {
  sequenceId: number = null;
  description: string = '';

  constructor(data?: Partial<ConditionTypeModel>) {
    super(data);
    Object.assign(this, data);
  }
  static deserialize(apiData: IAPIConditionType): ConditionTypeModel {
    if (!apiData) {
      return new ConditionTypeModel();
    }
    return new ConditionTypeModel({ ...apiData, id: apiData.conditionTypeId || apiData.id });
  }

  static deserializeList(conditionTypeList: IAPIConditionType[]): ConditionTypeModel[] {
    return conditionTypeList
      ? conditionTypeList.map((conditionType: IAPIConditionType) => ConditionTypeModel.deserialize(conditionType))
      : [];
  }

  public serialize(): IAPIConditionType {
    return {
      id: this.id,
      sequenceId: this.sequenceId,
      description: this.description,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value,
    };
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
