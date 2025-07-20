import { modelProtection, CoreModel, SelectOption, SettingsTypeModel } from '@wings-shared/core';
import { IAPIConditionTypeConfig } from '../Interfaces';
import { CONDITION_TYPE_VALUE } from '../Enums';

@modelProtection
export class ConditionTypeConfigModel extends CoreModel {
  conditionType: SettingsTypeModel;
  isDropDown: boolean = false;
  apiSource: string = '';
  conditionValueType: SelectOption;

  constructor(data?: Partial<ConditionTypeConfigModel>) {
    super(data);
    Object.assign(this, data);
    this.conditionType = data?.conditionType ? new SettingsTypeModel(data?.conditionType) : null;
  }

  static deserialize(apiData: IAPIConditionTypeConfig): ConditionTypeConfigModel {
    if (!apiData) {
      return new ConditionTypeConfigModel();
    }
    const data: Partial<ConditionTypeConfigModel> = {
      ...apiData,
      conditionType:SettingsTypeModel.deserialize({
        ...apiData.conditionType,
        id: apiData.conditionType?.id as number,
      }),
      isDropDown: apiData.isDropDown,
      apiSource: apiData.apiSource,
      conditionValueType: new SelectOption({
        value: apiData.conditionValueType,
        name: this.getConditionTypeName(apiData.conditionValueType),
      }),
    };
    return new ConditionTypeConfigModel(data);
  }

  static deserializeList(apiDataList: IAPIConditionTypeConfig[]): ConditionTypeConfigModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIConditionTypeConfig) => ConditionTypeConfigModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIConditionTypeConfig {
    return {
      id: this.id || 0,
      conditionTypeId: this.conditionType?.id,
      isDropDown: this.isDropDown,
      apiSource: this.apiSource,
      conditionValueType: this.conditionValueType.value as string,
    };
  }

  static getConditionTypeName(value: string) {
    switch (value) {
      case CONDITION_TYPE_VALUE.INTEGER:
        return 'Integer';
      case CONDITION_TYPE_VALUE.BOOLEAN:
        return 'Boolean';
      case CONDITION_TYPE_VALUE.DECIMAL:
        return 'Decimal';
      default:
        return 'String';
    }
  }
}
