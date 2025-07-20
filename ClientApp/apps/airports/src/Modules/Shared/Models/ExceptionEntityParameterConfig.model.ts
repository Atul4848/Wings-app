import { modelProtection, CoreModel, SelectOption, SettingsTypeModel } from '@wings-shared/core';
import { IAPIExceptionEntityParameterConfig } from '../Interfaces';
import { CONDITION_TYPE_VALUE, ENTITY_PARAMETER_TYPE } from '../Enums';

@modelProtection
export class ExceptionEntityParameterConfigModel extends CoreModel {
  isDropDown: boolean = false;
  apiSource: string = '';
  entityParameter: string = '';
  entityParameterType: SelectOption;
  exceptionEntityType: SettingsTypeModel;
  supportedOperators: SettingsTypeModel[];

  constructor(data?: Partial<ExceptionEntityParameterConfigModel>) {
    super(data);
    Object.assign(this, data);
    this.exceptionEntityType = data?.exceptionEntityType ? new SettingsTypeModel(data?.exceptionEntityType) : null;
  }

  static deserialize(apiData: IAPIExceptionEntityParameterConfig): ExceptionEntityParameterConfigModel {
    if (!apiData) {
      return new ExceptionEntityParameterConfigModel();
    }
    const data: Partial<ExceptionEntityParameterConfigModel> = {
      ...apiData,
      exceptionEntityType: SettingsTypeModel.deserialize({
        ...apiData.exceptionEntityType,
        id: apiData.exceptionEntityType?.exceptionEntityTypeId || apiData.exceptionEntityType?.id,
      }),
      entityParameterType: new SelectOption({
        value: apiData.entityParameterType,
        name: this.getConditionTypeName(apiData.entityParameterType),
      }),
      supportedOperators: apiData.supportedOperators?.map(
        x =>
          new SettingsTypeModel({
            ...x,
            id: x.exceptionConditionalOperatorId || x.id,
          })
      ),
    };
    return new ExceptionEntityParameterConfigModel(data);
  }

  static deserializeList(apiDataList: IAPIExceptionEntityParameterConfig[]): ExceptionEntityParameterConfigModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIExceptionEntityParameterConfig) =>
        ExceptionEntityParameterConfigModel.deserialize(apiData)
      )
      : [];
  }

  public serialize(): IAPIExceptionEntityParameterConfig {
    return {
      id: this.id || 0,
      exceptionEntityTypeId: this.exceptionEntityType?.id,
      isDropDown: this.isDropDown,
      apiSource: this.apiSource,
      entityParameter: this.entityParameter,
      entityParameterType: this.entityParameterType?.name,
    };
  }

  static getConditionTypeName(value: string) {
    switch (value) {
      case ENTITY_PARAMETER_TYPE.INTEGER:
        return 'Integer';
      case ENTITY_PARAMETER_TYPE.BOOLEAN:
        return 'Boolean';
      default:
        return 'String';
    }
  }
}
