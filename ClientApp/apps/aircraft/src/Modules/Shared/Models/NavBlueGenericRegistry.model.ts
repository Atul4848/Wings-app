import { IAPINavBlueGenericRegistry } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
@modelProtection
export class NavBlueGenericRegistryModel extends CoreModel implements ISelectOption {
  navBlueGenericRegistryId: number = 0;
  navBlueGenericRegistry: string = '';
  rampHeight: number = null;
  mtow: number = null;
  zeroFuelWeight: number = null;
  maxLandingWeight: number = null;
  tankCapacity: number = null;
  bow: number = null;
  weightUOMName: string = '';
  constructor(data?: Partial<NavBlueGenericRegistryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPINavBlueGenericRegistry): NavBlueGenericRegistryModel {
    if (!apiData) {
      return new NavBlueGenericRegistryModel();
    }
    const data: Partial<NavBlueGenericRegistryModel> = {
      ...apiData,
      id: apiData.navBlueGenericRegistryId,
    };
    return new NavBlueGenericRegistryModel(data);
  }

  public serialize(): IAPINavBlueGenericRegistry {
    return {
      id: this.navBlueGenericRegistryId,
      name: this.name,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
      navBlueGenericRegistry: this.navBlueGenericRegistry,
      rampHeight: Number(this.rampHeight),
      mtow: Number(this.mtow),
      zeroFuelWeight: Number(this.zeroFuelWeight),
      maxLandingWeight: Number(this.maxLandingWeight),
      tankCapacity: Number(this.tankCapacity),
      bow: Number(this.bow),
      weightUOMName: this.weightUOMName,
    };
  }

  static deserializeList(apiDataList: IAPINavBlueGenericRegistry[]): NavBlueGenericRegistryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPINavBlueGenericRegistry) => NavBlueGenericRegistryModel.deserialize(apiData))
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
