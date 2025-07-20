import { CoreModel, ISelectOption, modelProtection, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIItem18 } from '../../Interfaces';

@modelProtection
export class Item18Model extends CoreModel implements ISelectOption {
  aircraftAddressCode: string;
  performanceBasedNavigation: {
    areaNav10s: IdNameCodeModel[];
    areaNav5s: IdNameCodeModel[];
    areaNav2s: IdNameCodeModel[];
    areaNav1s: IdNameCodeModel[];
    requiredNavPerformance4s: IdNameCodeModel[];
    requiredNavPerformance2s: SettingsTypeModel[];
    requiredNavPerformance1s: IdNameCodeModel[];
    requiredNavPerformanceApproach: IdNameCodeModel;
    requiredNavPerformanceARApproach: IdNameCodeModel;
  };

  constructor(data?: Partial<Item18Model>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIItem18): Item18Model {
    if (!apiData) {
      return new Item18Model();
    }
    const data: Partial<Item18Model> = {
      ...apiData,
    };
    return new Item18Model(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
