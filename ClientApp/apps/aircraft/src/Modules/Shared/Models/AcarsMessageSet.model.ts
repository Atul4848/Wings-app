import { IAPIAcarsMessageSet } from '../Interfaces';
import { AcarsSoftwareVersionModel } from './AcarsSoftwareVersion.model';
import { AccessLevelModel, CoreModel, ISelectOption, SourceTypeModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class AcarsMessageSetModel extends CoreModel implements ISelectOption {
  acarsSoftwareVersion: AcarsSoftwareVersionModel;
  constructor(data?: Partial<AcarsMessageSetModel>) {
    super(data);
    Object.assign(this, data);
    this.acarsSoftwareVersion = new AcarsSoftwareVersionModel(data?.acarsSoftwareVersion);
  }

  static deserialize(apiData: IAPIAcarsMessageSet): AcarsMessageSetModel {
    if (!apiData) {
      return new AcarsMessageSetModel();
    }
    const data: Partial<AcarsMessageSetModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      acarsSoftwareVersion: AcarsSoftwareVersionModel.deserialize({
        ...apiData.acarsSoftwareVersion,
      }),
    };
    return new AcarsMessageSetModel(data);
  }

  public serialize(): IAPIAcarsMessageSet {
    return {
      id: this.id,
      name: this.name,
      acarsSoftwareVersionId: this.acarsSoftwareVersion?.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIAcarsMessageSet[]): AcarsMessageSetModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAcarsMessageSet) => AcarsMessageSetModel.deserialize(apiData))
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
