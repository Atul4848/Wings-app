import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIFmsModel } from '../Interfaces';
@modelProtection
export class FmsModel extends CoreModel implements ISelectOption {
  fmsManufacturer: SettingsTypeModel;
  constructor(data?: Partial<FmsModel>) {
    super(data);
    Object.assign(this, data);
    this.fmsManufacturer = new SettingsTypeModel(data?.fmsManufacturer);
  }

  static deserialize(apiFMSModel: IAPIFmsModel): FmsModel {
    if (!apiFMSModel) {
      return new FmsModel();
    }
    const data: Partial<FmsModel> = {
      ...apiFMSModel,
      id: apiFMSModel.id || apiFMSModel.fmsModelId,
      fmsManufacturer: SettingsTypeModel.deserialize({
        ...apiFMSModel.fmsManufacturer,
        id: apiFMSModel.fmsManufacturer?.fmsManufacturerReferenceId,
      }),
    };
    return new FmsModel(data);
  }

  public serialize(): IAPIFmsModel {
    return {
      id: this.id,
      name: this.name,
      fmsManufacturerId: this.fmsManufacturer?.id,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
    };
  }

  static deserializeList(apiDataList: IAPIFmsModel[]): FmsModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIFmsModel) => FmsModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
