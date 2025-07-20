import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIFmsSoftwareVersion } from '../Interfaces';
import { FmsModel } from './FmsModel.model';

@modelProtection
export class FmsSoftwareVersionModel extends CoreModel implements ISelectOption {
  fmsModel: FmsModel;
  constructor(data?: Partial<FmsSoftwareVersionModel>) {
    super(data);
    Object.assign(this, data);
    this.fmsModel = new FmsModel(data?.fmsModel);
  }

  static deserialize(apiData: IAPIFmsSoftwareVersion): FmsSoftwareVersionModel {
    if (!apiData) {
      return new FmsSoftwareVersionModel();
    }
    const data: Partial<FmsSoftwareVersionModel> = {
      ...apiData,
      fmsModel: FmsModel.deserialize({
        ...apiData.fmsModel,
      }),
    };
    return new FmsSoftwareVersionModel(data);
  }

  public serialize(): IAPIFmsSoftwareVersion {
    return {
      id: this.id,
      name: this.name,
      fmsModelId: this.fmsModel?.id,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
    };
  }

  static deserializeList(apiDataList: IAPIFmsSoftwareVersion[]): FmsSoftwareVersionModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIFmsSoftwareVersion) => FmsSoftwareVersionModel.deserialize(apiData))
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
