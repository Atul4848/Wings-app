import { IAPIAesModel } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class AesModel extends CoreModel implements ISelectOption {
  aesManufacturer: SettingsTypeModel;
  constructor(data?: Partial<AesModel>) {
    super(data);
    Object.assign(this, data);
    this.aesManufacturer = new SettingsTypeModel(data?.aesManufacturer);
  }

  static deserialize(apiData: IAPIAesModel): AesModel {
    if (!apiData) {
      return new AesModel();
    }
    const data: Partial<AesModel> = {
      ...apiData,
      aesManufacturer: SettingsTypeModel.deserialize({
        ...apiData.aesManufacturer,
        id: apiData.aesManufacturer?.aesManufacturerId,
      }),
    };
    return new AesModel(data);
  }

  public serialize(): IAPIAesModel {
    return {
      id: this.id,
      name: this.name,
      aesManufacturerId: this.aesManufacturer?.id,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
    };
  }

  static deserializeList(apiDataList: IAPIAesModel[]): AesModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIAesModel) => AesModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
