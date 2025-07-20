import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIRuleEntityParameterConfig } from '../Interfaces';
import { PERMIT_RULE_SOURCES } from '../Enums';

@modelProtection
export class RuleEntityParameterConfigModel extends CoreModel implements ISelectOption {
  entityParameter: string = '';
  entityParameterType: string = '';
  isDropDown: boolean = false;
  apiSource: PERMIT_RULE_SOURCES;
  ruleEntityType: SettingsTypeModel;
  supportedOperators: SettingsTypeModel[];

  constructor(data?: Partial<RuleEntityParameterConfigModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiRuleEntityConfig: IAPIRuleEntityParameterConfig): RuleEntityParameterConfigModel {
    if (!apiRuleEntityConfig) {
      return new RuleEntityParameterConfigModel();
    }
    return new RuleEntityParameterConfigModel({
      ...apiRuleEntityConfig,
      id: apiRuleEntityConfig?.id || Utilities.getTempId(true),
      ruleEntityType: SettingsTypeModel.deserialize(apiRuleEntityConfig?.ruleEntityType),
      supportedOperators: SettingsTypeModel.deserializeList(apiRuleEntityConfig?.supportedOperators),
    });
  }

  static deserializeList(apiRuleEntityConfigs: IAPIRuleEntityParameterConfig[]): RuleEntityParameterConfigModel[] {
    return apiRuleEntityConfigs
      ? apiRuleEntityConfigs.map((apiRuleEntityConfig: IAPIRuleEntityParameterConfig) =>
        RuleEntityParameterConfigModel.deserialize(apiRuleEntityConfig)
      )
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
