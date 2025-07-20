import { ISelectOption, IdNameCodeModel, SettingsTypeModel, getYesNoNullToBoolean } from '@wings-shared/core';
import { IAPIConditionValue } from '../Interfaces';

export class ConditionValueModel implements ISelectOption {
  id: number;
  conditionId: number;
  // This Entity Can be Any type as per the Selected option
  entityValueId: number;
  entityValueCode: string;
  entityValue: string | boolean;

  // isTempId
  isTempId: boolean = false;

  constructor(data?: Partial<ConditionValueModel>) {
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIConditionValue): ConditionValueModel {
    if (!apiData) {
      return new ConditionValueModel();
    }
    const data = {
      ...apiData,
      id: apiData.airportHoursConditionValueId || apiData.id,
      entityValue: [ 'true', 'false', 'yes', 'no' ].includes(String(apiData.entityValue)?.toLowerCase())
        ? getYesNoNullToBoolean(apiData.entityValue)
        : apiData.entityValue,
    };
    return new ConditionValueModel(data);
  }

  static deserializeList(valuesList: IAPIConditionValue[]): ConditionValueModel[] {
    const values = valuesList
      ? valuesList.map((value: IAPIConditionValue) => ConditionValueModel.deserialize(value))
      : [];
    return values.filter(x => x.entityValue?.toString());
  }

  public serialize(conditionId): IAPIConditionValue {
    return {
      id: this.id,
      conditionId: conditionId || 0,
      // This Entity Can be Any type as per the Selected option
      entityValueId: this.isTempId ? null : this.entityValueId,
      entityValueCode: this.entityValueCode,
      entityValue: this.entityValue?.toString(),
    };
  }

  public get label(): string {
    return this.entityValue;
  }

  public get value(): string | number {
    return this.entityValueId;
  }

  // Extra Helping
  static mapEntity(entityValueId: number, entityValue: string, entityValueCode?: string): ConditionValueModel {
    return new ConditionValueModel({ entityValueId, entityValue: entityValue || '', entityValueCode });
  }

  // If response is Already in Id Name code format then we can use this simple method
  static mapIdNameCodeEntities(list: IdNameCodeModel[]): ConditionValueModel[] {
    return list.map(
      x => new ConditionValueModel({ entityValueId: x.id, entityValue: x.name || '', entityValueCode: x.code })
    );
  }

  // If response is Already in SettingsType format then we can use this simple method
  static mapSettingsTypeModel(list: SettingsTypeModel[]): ConditionValueModel[] {
    return list.map(x => new ConditionValueModel({ entityValueId: x.id, entityValue: x.name || '' }));
  }
}
