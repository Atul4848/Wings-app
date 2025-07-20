import { CoreModel, ISelectOption, modelProtection, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIItem10B } from '../../Interfaces';

@modelProtection
export class Item10BModel extends CoreModel implements ISelectOption {
  transponderType: SettingsTypeModel;
  uat: SettingsTypeModel;
  udlMode: SettingsTypeModel;
  freqMhz: SettingsTypeModel;
  adsC: IdNameCodeModel[];

  constructor(data?: Partial<Item10BModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIItem10B): Item10BModel {
    if (!apiData) {
      return new Item10BModel();
    }
    const data: Partial<Item10BModel> = {
      ...apiData,
    };
    return new Item10BModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
