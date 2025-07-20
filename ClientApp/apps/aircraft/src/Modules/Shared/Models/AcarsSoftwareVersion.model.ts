import { IAPIAcarsSoftwareVersion } from '../Interfaces';
import { AcarsModel } from './AcarsModel.model';
import { AccessLevelModel, CoreModel, ISelectOption, SourceTypeModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class AcarsSoftwareVersionModel extends CoreModel implements ISelectOption {
  acarsModel: AcarsModel;
  constructor(data?: Partial<AcarsSoftwareVersionModel>) {
    super(data);
    Object.assign(this, data);
    this.acarsModel = new AcarsModel(data?.acarsModel);
  }

  static deserialize(apiData: IAPIAcarsSoftwareVersion): AcarsSoftwareVersionModel {
    if (!apiData) {
      return new AcarsSoftwareVersionModel();
    }
    const data: Partial<AcarsSoftwareVersionModel> = {
      ...apiData,
      id: apiData.id || apiData.acarsSoftwareVersionId,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      acarsModel: AcarsModel.deserialize({
        ...apiData.acarsModel,
      }),
    };
    return new AcarsSoftwareVersionModel(data);
  }

  public serialize(): IAPIAcarsSoftwareVersion {
    return {
      id: this.id,
      name: this.name,
      acarsModelId: this.acarsModel?.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIAcarsSoftwareVersion[]): AcarsSoftwareVersionModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAcarsSoftwareVersion) => AcarsSoftwareVersionModel.deserialize(apiData))
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
