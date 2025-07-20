import { IAPIModelMake } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class AircraftModelMakeModel extends CoreModel implements ISelectOption {
  make: SettingsTypeModel;
  isLargeAircraft: boolean = false;
  constructor(data?: Partial<AircraftModelMakeModel>) {
    super();
    Object.assign(this, data);
    this.make = data?.make ? new SettingsTypeModel(data?.make) : null;
  }

  static deserialize(apiData: IAPIModelMake): AircraftModelMakeModel {
    if (!apiData) {
      return new AircraftModelMakeModel();
    }

    return new AircraftModelMakeModel({
      ...apiData,
      make: SettingsTypeModel.deserialize({ ...apiData.make, id: apiData.make?.makeId }),
    });
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
