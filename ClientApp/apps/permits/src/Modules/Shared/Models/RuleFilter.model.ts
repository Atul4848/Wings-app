import { regex, Utilities, modelProtection, CoreModel, SettingsTypeModel, ISelectOption } from '@wings-shared/core';
import { IAPIRuleFilter, IAPIRuleRequest } from '../Interfaces';
import { RuleValueModel, RuleEntityParameterConfigModel } from '../Models';

@modelProtection
export class RuleFilterModel extends CoreModel implements ISelectOption {
  propertyName: string = '';
  order: number = 0;
  ruleLogicalOperator: SettingsTypeModel;
  ruleEntityType: SettingsTypeModel;
  ruleField: SettingsTypeModel;
  ruleConditionalOperator: SettingsTypeModel;
  ruleValues: RuleValueModel[];
  tempId: number = 0;

  //view fields
  isDeleteRuleConfirmed: boolean = false;
  exceptionRuleValues: RuleValueModel[];

  constructor(data?: Partial<RuleFilterModel>) {
    super(data);
    Object.assign(this, data);
    this.tempId = data?.id || data?.tempId || Utilities.getTempId(true);
    this.ruleValues = data?.ruleValues?.map((a: RuleValueModel) => new RuleValueModel(a)) || [];
  }

  static deserialize(apiRuleFilter: IAPIRuleFilter): RuleFilterModel {
    if (!apiRuleFilter) {
      return new RuleFilterModel();
    }

    return new RuleFilterModel({
      ...apiRuleFilter,
      id: apiRuleFilter?.ruleId || apiRuleFilter?.id,
      ruleLogicalOperator: SettingsTypeModel.deserialize({
        ...apiRuleFilter?.ruleLogicalOperator,
        id: apiRuleFilter?.ruleLogicalOperator?.ruleLogicalOperatorId || apiRuleFilter?.ruleLogicalOperator?.id,
      }),
      ruleConditionalOperator: SettingsTypeModel.deserialize({
        ...apiRuleFilter?.ruleConditionalOperator,
        id:
          apiRuleFilter?.ruleConditionalOperator?.ruleConditionalOperatorId ||
          apiRuleFilter?.ruleConditionalOperator?.id,
      }),
      ruleEntityType: SettingsTypeModel.deserialize({
        ...apiRuleFilter?.ruleEntityType,
        id: apiRuleFilter?.ruleEntityType?.ruleEntityTypeId || apiRuleFilter?.ruleEntityType?.id,
      }),
      ruleField: SettingsTypeModel.deserialize({
        id: Utilities.getTempId(true),
        name: apiRuleFilter?.propertyName,
      }),
      ruleValues: RuleValueModel.deserializeList(apiRuleFilter?.ruleValues),
      exceptionRuleValues: RuleValueModel.deserializeList(apiRuleFilter?.ruleValues),
    });
  }

  static deserializeList(apiRuleFilters: IAPIRuleFilter[]): RuleFilterModel[] {
    return apiRuleFilters
      ? apiRuleFilters.map((apiRuleFilter: IAPIRuleFilter) => RuleFilterModel.deserialize(apiRuleFilter))
      : [];
  }

  private getSerializeRuleValueId(ruleData: RuleValueModel): number {
    if (this.hasInOperator || this.hasNotInOperator) {
      return this.exceptionRuleValues?.find(rule => Utilities.isEqual(rule.ruleValue, ruleData.ruleValue))?.id || 0;
    }

    if (Array.isArray(this.exceptionRuleValues) && Boolean(this.exceptionRuleValues?.length)) {
      return this.exceptionRuleValues[0].id;
    }

    return 0;
  }

  public serialize(): IAPIRuleRequest {
    return {
      id: this.id || 0,
      order: this.order,
      propertyName: this.ruleField?.name,
      ruleLogicalOperatorId: this.ruleLogicalOperator?.id,
      ruleConditionalOperatorId: this.ruleConditionalOperator?.id,
      ruleEntityTypeId: this.ruleEntityType?.id,
      ruleValues: this.ruleValues?.map((ruleData: RuleValueModel) => ({
        id: ruleData.id || this.getSerializeRuleValueId(ruleData),
        ruleValue: ruleData.ruleValue,
        code: ruleData.code,
      })),
    };
  }

  public get hasInOperator(): boolean {
    return Utilities.isEqual(this.ruleConditionalOperator?.name, 'In');
  }

  public get hasNotInOperator(): boolean {
    return Utilities.isEqual(this.ruleConditionalOperator?.name, 'NotIn');
  }

  public get hasValidRuleValue(): boolean {
    if (!Boolean(this.ruleValues?.length)) {
      return false;
    }

    return this.ruleValues.some(
      ({ code, ruleValue }: RuleValueModel) => regex.all.test(code) || regex.all.test(ruleValue?.toString())
    );
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }

  public hasInValidRuleFilter(index: number): boolean {
    return (
      (index === 0 ? false : !Boolean(this.ruleLogicalOperator?.id)) ||
      !Boolean(this.ruleEntityType?.id) ||
      !Boolean(this.ruleField?.id) ||
      !Boolean(this.ruleConditionalOperator?.id) ||
      !this.hasValidRuleValue
    );
  }

  public hasInvalidRuleValue(entityParamConfig: RuleEntityParameterConfigModel): string {
    if (entityParamConfig?.entityParameterType === 'Int32' && this.ruleValues.length > 0) {
      const isMinMaxFlightLevelInCountry = [ 'MaxFlightLevelInCountry', 'MinFlightLevelInCountry' ].includes(
        entityParamConfig?.entityParameter
      );
      if (isMinMaxFlightLevelInCountry) {
        return regex.minMaxFlightLevelInCountry.test(this.ruleValues[0].ruleValue?.toString().trim())
          ? ''
          : 'The field must be between -999999 and 99999.';
      }
      return regex.numberOnly.test(this.ruleValues[0].ruleValue?.toString().trim())
        ? ''
        : 'The field must be a number.';
    }
    if (entityParamConfig?.entityParameter === 'FIRAirways') {
      const value = this.ruleValues[0]?.ruleValue as string;
      if (value?.length > 15) {
        return 'Value should not be greater than 15 characters';
      }
      return value?.length && !regex.firAirwaysFormat.test(this.ruleValues[0]?.ruleValue?.toString().trim())
        ? 'Value format should be like ZJSA(A1)'
        : '';
    }
    return '';
  }
}
