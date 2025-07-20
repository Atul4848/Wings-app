import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { ILocationOperationalEssential } from '../Interfaces';
import { AppliedOperationType } from './AppliedOperationType.model';

@modelProtection
export class LocationOperationalEssentialModel extends CoreModel implements ISelectOption {
  vendorLevel: SettingsTypeModel;
  appliedOperationType: AppliedOperationType[];

  constructor(data?: Partial<LocationOperationalEssentialModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: ILocationOperationalEssential): LocationOperationalEssentialModel {
    if (!apiData) {
      return new LocationOperationalEssentialModel();
    }
    const data: Partial<LocationOperationalEssentialModel> = {
      ...apiData,
      vendorLevel: SettingsTypeModel.deserialize(apiData.vendorLevel),
      appliedOperationType: AppliedOperationType.deserializeList(apiData.appliedOperationType),
    };
    return new LocationOperationalEssentialModel(data);
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
