import {
  CoreModel,
  ISelectOption,
  IdNameCodeModel,
  SettingsTypeModel,
  Utilities,
  modelProtection,
} from '@wings-shared/core';
import { IAPIRuleValue } from '../Interfaces';
import { AirportModel, StateModel } from '@wings/shared';

@modelProtection
export class PermitDocumentRuleValueModel extends CoreModel implements ISelectOption {
  tempId?: number = 0;
  code: string = '';
  ruleValue: string | number;
  toolTip?: string = '';

  constructor(data?: Partial<PermitDocumentRuleValueModel>) {
    super(data);
    Object.assign(this, data);
    this.tempId = data?.id || data?.tempId || Utilities.getTempId(true);
  }

  static deserialize(apiData: IAPIRuleValue): PermitDocumentRuleValueModel {
    if (!apiData) {
      return new PermitDocumentRuleValueModel();
    }
    return new PermitDocumentRuleValueModel({
      ...apiData,
      id: apiData?.ruleFilterValueId || apiData?.id,
      name: apiData?.code || (apiData?.ruleValue as string),
    });
  }

  static deserializeList(apiDataList: IAPIRuleValue[]): PermitDocumentRuleValueModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRuleValue) => PermitDocumentRuleValueModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name || this.code || (this.ruleValue as string);
  }

  public get value(): string | number {
    return Number(this.ruleValue);
  }

  // If response is Already in SettingsType format then we can use this simple method
  static mapSettingsTypeModel(list: SettingsTypeModel[]): PermitDocumentRuleValueModel[] {
    return list.map(x => new PermitDocumentRuleValueModel({ ruleValue: x.id, code: x.name || '' }));
  }

  // If response is Already in Id Name code format then we can use this simple method
  static mapIdNameCodeEntities(list: IdNameCodeModel[]): PermitDocumentRuleValueModel[] {
    return list.map(x => new PermitDocumentRuleValueModel({ ruleValue: x.name || '', code: x.code }));
  }

  static mapIdNameCodeEntitiesOfState(list: StateModel[]): PermitDocumentRuleValueModel[] {
    return list.map(
      x => new PermitDocumentRuleValueModel({ ruleValue: x.id || '', code: `${x.commonName} (${x.isoCode})` })
    );
  }

  static mapIdNameCodeEntitiesOfAirport(list: AirportModel[]): PermitDocumentRuleValueModel[] {
    return list.map(
      x => new PermitDocumentRuleValueModel({ ruleValue: x.id || '', code: `${x.name} (${x.displayCode})` })
    );
  }

  // Extra Helping
  static mapEntity(code: string, ruleValue: string | number): PermitDocumentRuleValueModel {
    return new PermitDocumentRuleValueModel({ code: code || '', ruleValue });
  }

  /**
 * Normalize label when code is null and label is 'True'/'False'
 */
  static mapBooleanFields(data: Partial<PermitDocumentRuleValueModel>[]): PermitDocumentRuleValueModel[] {
    return data.map(x => {
      let name = x.name;
  
      if (x.code == null && typeof name === 'string') {
        const lower = name.toLowerCase();
        if (lower === 'true') name = 'Yes';
        else if (lower === 'false') name = 'No';
      }
  
      return new PermitDocumentRuleValueModel({ ...x, name });
    });
  }
  

}
