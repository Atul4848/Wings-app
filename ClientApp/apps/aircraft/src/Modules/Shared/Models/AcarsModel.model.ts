import { IAPIAcarsModel } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';

@modelProtection
export class AcarsModel extends CoreModel implements ISelectOption {
  acarsManufacturer: SettingsTypeModel;
  constructor(data?: Partial<AcarsModel>) {
    super(data);
    Object.assign(this, data);
    this.acarsManufacturer = new SettingsTypeModel(data?.acarsManufacturer);
  }

  static deserialize(apiACARSModel: IAPIAcarsModel): AcarsModel {
    if (!apiACARSModel) {
      return new AcarsModel();
    }
    const data: Partial<AcarsModel> = {
      ...apiACARSModel,
      id: apiACARSModel.id || apiACARSModel.acarsModelId,
      accessLevel: AccessLevelModel.deserialize(apiACARSModel.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiACARSModel.sourceType),
      acarsManufacturer: SettingsTypeModel.deserialize({
        ...apiACARSModel.acarsManufacturer,
        id: apiACARSModel.acarsManufacturer?.acarsManufacturerReferenceId,
      }),
    };
    return new AcarsModel(data);
  }

  public serialize(): IAPIAcarsModel {
    return {
      id: this.id,
      name: this.name,
      acarsManufacturerId: this.acarsManufacturer?.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIAcarsModel[]): AcarsModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIAcarsModel) => AcarsModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
