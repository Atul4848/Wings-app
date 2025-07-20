import { modelProtection, MODEL_STATUS, ISelectOption, SettingsTypeModel } from '@wings-shared/core';
import { IAPIConditionalOperator } from '../Interfaces';

@modelProtection
export class ConditionalOperatorModel extends SettingsTypeModel implements ISelectOption {
  operator: string = '';

  constructor(data?: Partial<ConditionalOperatorModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIConditionalOperator): ConditionalOperatorModel {
    if (!apiData) {
      return new ConditionalOperatorModel();
    }
    return new ConditionalOperatorModel({ ...apiData, id: apiData.conditionalOperatorId || apiData.id });
  }

  static deserializeList(conditionalOperatorList: IAPIConditionalOperator[]): ConditionalOperatorModel[] {
    return conditionalOperatorList
      ? conditionalOperatorList.map((conditionalOperator: IAPIConditionalOperator) =>
        ConditionalOperatorModel.deserialize(conditionalOperator)
      )
      : [];
  }

  public serialize(): IAPIConditionalOperator {
    const data: IAPIConditionalOperator = {
      id: this.id,
      operator: this.operator,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value || MODEL_STATUS.ACTIVE,
    };
    return data;
  }

  public get label(): string {
    return this.operator;
  }

  public get value(): string | number {
    return this.id;
  }
}
