import { CoreModel, ISelectOption, Utilities, modelProtection } from '@wings-shared/core';
import { IAPIRuleValue } from '../Interfaces';

@modelProtection
export class RuleValueModel extends CoreModel implements ISelectOption {
  tempId?: number = 0;
  code: string = '';
  ruleValue: string | number;
  toolTip?: string = '';

  constructor(data?: Partial<RuleValueModel>) {
    super(data);
    Object.assign(this, data);
    this.tempId = data?.id || data?.tempId || Utilities.getTempId(true);
  }

  static deserialize(apiData: IAPIRuleValue): RuleValueModel {
    if (!apiData) {
      return new RuleValueModel();
    }
    return new RuleValueModel({
      ...apiData,
      id: apiData?.ruleFilterValueId || apiData?.id,
      name: apiData?.code || (apiData?.ruleValue as string),
    });
  }

  static deserializeList(apiDataList: IAPIRuleValue[]): RuleValueModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIRuleValue) => RuleValueModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name || this.code || (this.ruleValue as string);
  }

  public get value(): string | number {
    return (this.id || this.tempId) as number;
  }
}