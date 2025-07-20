import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPermitExceptionRule, IAPIPermitExceptionRuleRequest } from '../Interfaces';
import { RuleFilterModel } from './RuleFilter.model';

@modelProtection
export class PermitExceptionRuleModel extends CoreModel implements ISelectOption {
  ruleFilters: RuleFilterModel[];
  tempId: number = 0;
  permitRequirementType: SettingsTypeModel;

  constructor(data?: Partial<PermitExceptionRuleModel>) {
    super(data);
    Object.assign(this, data);
    this.tempId = data?.id || data?.tempId || Utilities.getTempId(true);
    this.ruleFilters = data?.ruleFilters?.map((a: RuleFilterModel) => new RuleFilterModel(a)) || [];
    this.permitRequirementType = new SettingsTypeModel(data?.permitRequirementType);
  }

  static deserialize(apiPermitExceptionRule: IAPIPermitExceptionRule): PermitExceptionRuleModel {
    if (!apiPermitExceptionRule) {
      return new PermitExceptionRuleModel();
    }
    return new PermitExceptionRuleModel({
      ...apiPermitExceptionRule,
      id: apiPermitExceptionRule?.permitExceptionRuleId || apiPermitExceptionRule?.id,
      ruleFilters: RuleFilterModel.deserializeList(apiPermitExceptionRule?.ruleFilters),
      permitRequirementType: SettingsTypeModel.deserialize({
        ...apiPermitExceptionRule?.permitRequirementType,
        id:
          apiPermitExceptionRule?.permitRequirementType?.permitRequirementTypeId ||
          apiPermitExceptionRule?.permitRequirementType?.id,
      }),
    });
  }

  static deserializeList(apiPermitExceptionRules: IAPIPermitExceptionRule[]): PermitExceptionRuleModel[] {
    return apiPermitExceptionRules
      ? apiPermitExceptionRules.map((apiPermitExceptionRule: IAPIPermitExceptionRule) =>
        PermitExceptionRuleModel.deserialize(apiPermitExceptionRule)
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

  public get hasInvalidRuleFilter(): boolean {
    if (!Boolean(this.ruleFilters?.length)) {
      return true;
    }

    return this.ruleFilters.some(
      (ruleFilter: RuleFilterModel, index: number) =>
        ruleFilter.hasInValidRuleFilter(index) || !Boolean(this.permitRequirementType?.id)
    );
  }

  public get hasInvalidName(): string {
    return this.name.length > 100 ? 'The field must be between 1 and 100.' : '';
  }

  public ruleFiltersObject(jsonObject: object): object {
    const arrayFields = [
      'RegistrationNationalityRegion',
      'CountriesOverflown',
      'DepartureRegion',
      'NextDestinationRegion',
      'OperatorNationalityRegion',
      'FIRAirways',
      'CrossingType',
    ];

    this.ruleFilters.forEach((currentValue: RuleFilterModel) => {
      if (!jsonObject.hasOwnProperty(currentValue.ruleEntityType.name)) {
        jsonObject[currentValue.ruleEntityType.name] = {};
      }
      jsonObject[currentValue.ruleEntityType.name][currentValue.ruleField.name] = arrayFields.includes(
        currentValue.ruleField.name
      )
        ? []
        : '';
    });
    return jsonObject;
  }

  public serialize(): IAPIPermitExceptionRuleRequest {
    return {
      id: this.id || 0,
      name: this.name,
      permitRequirementTypeId: this.permitRequirementType?.id,
      ruleFilters: this.ruleFilters?.map((ruleFilter: RuleFilterModel, idx: number) => ({
        ...ruleFilter.serialize(),
        order: idx + 1,
      })),
    };
  }
}
