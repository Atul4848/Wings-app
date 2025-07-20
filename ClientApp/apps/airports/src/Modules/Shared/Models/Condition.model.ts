import { ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPICondition } from '../Interfaces';
import { ConditionalOperatorModel } from './ConditionalOperator.model';
import { ConditionTypeModel } from './ConditionType.model';
import { ConditionValueModel } from './ConditionValue.model';

@modelProtection
export class ConditionModel extends SettingsTypeModel implements ISelectOption {
  conditionType: ConditionTypeModel;
  conditionalOperator: ConditionalOperatorModel;
  conditionValues: ConditionValueModel[] = [];

  constructor(data?: Partial<ConditionModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICondition): ConditionModel {
    if (!apiData) {
      return new ConditionModel();
    }
    const data: Partial<ConditionModel> = {
      ...apiData,
      id: apiData.conditionId || apiData.id,
      conditionType: ConditionTypeModel.deserialize(apiData.conditionType),
      conditionalOperator: ConditionalOperatorModel.deserialize(apiData.conditionalOperator),
      conditionValues: ConditionValueModel.deserializeList(apiData.airportHoursConditionValues),
    };
    const result = new ConditionModel(data);
    return result;
  }

  static deserializeList(closureConditionList: IAPICondition[]): ConditionModel[] {
    return closureConditionList
      ? closureConditionList.map((airportHoursSubTypes: IAPICondition) =>
        ConditionModel.deserialize(airportHoursSubTypes)
      )
      : [];
  }

  public serialize(): IAPICondition {
    if (!this.conditionType?.id) {
      return null;
    }

    return {
      id: this.id || 0,
      conditionTypeId: this.conditionType?.id,
      conditionalOperatorId: this.conditionalOperator?.id,
      airportHoursConditionValues: this.conditionValues.map(x => x.serialize(this.id)),
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
    };
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
