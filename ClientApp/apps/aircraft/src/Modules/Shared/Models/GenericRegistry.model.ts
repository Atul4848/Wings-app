import { CoreModel, ISelectOption, Utilities, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIGenericRegistry } from '../Interfaces';

@modelProtection
export class GenericRegistryModel extends CoreModel implements ISelectOption {
  weightUOM: SettingsTypeModel;
  rampWeight: number = null;
  mtow: number = null;
  zeroFuelWeight: number = null;
  maxLandingWeight: number = null;
  tankCapacity: number = null;
  bow: number = null;
  restrictExternalUse: boolean = false;
  performance: SettingsTypeModel;

  constructor(data?: Partial<GenericRegistryModel>) {
    super(data);
    Object.assign(this, data);
    this.weightUOM = new SettingsTypeModel(data?.weightUOM);
  }

  static deserialize(apiData: IAPIGenericRegistry): GenericRegistryModel {
    if (!apiData) {
      return new GenericRegistryModel();
    }
    const data: Partial<GenericRegistryModel> = {
      ...apiData,
      id: apiData.navBlueGenericRegistryId || apiData.id,
      weightUOM: SettingsTypeModel.deserialize({ ...apiData?.weightUOM, id: apiData.weightUOM?.weightUOMId }),
      performance: SettingsTypeModel.deserialize({ ...apiData?.performance, id: apiData.performance?.performanceId }),
    };
    return new GenericRegistryModel(data);
  }

  public serialize(): IAPIGenericRegistry {
    return {
      id: this.id,
      name: this.name,
      weightUOMId: this.weightUOM.id,
      rampWeight: Utilities.getNumberOrNullValue(this.rampWeight),
      mtow: Utilities.getNumberOrNullValue(this.mtow),
      zeroFuelWeight: Utilities.getNumberOrNullValue(this.zeroFuelWeight),
      maxLandingWeight: Utilities.getNumberOrNullValue(this.maxLandingWeight),
      tankCapacity: Utilities.getNumberOrNullValue(this.tankCapacity),
      bow: Utilities.getNumberOrNullValue(this.bow),
      restrictExternalUse: this.restrictExternalUse,
    };
  }

  static deserializeList(apiDataList: IAPIGenericRegistry[]): GenericRegistryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIGenericRegistry) => GenericRegistryModel.deserialize(apiData))
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
