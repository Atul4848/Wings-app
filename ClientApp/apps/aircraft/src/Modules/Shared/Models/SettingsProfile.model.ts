import { IAPISettingsProfile } from '../Interfaces';
import { AccessLevelModel, CoreModel, SourceTypeModel, modelProtection } from '@wings-shared/core';
@modelProtection
export class SettingsProfileModel extends CoreModel {
  profile: string = '';
  description: string = '';

  constructor(data?: Partial<SettingsProfileModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPISettingsProfile): SettingsProfileModel {
    if (!apiData) {
      return new SettingsProfileModel();
    }
    const data: Partial<SettingsProfileModel> = {
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      name: apiData.profile,
      ...apiData,
    };
    return new SettingsProfileModel(data);
  }

  public serialize(): IAPISettingsProfile {
    return {
      id: this.id,
      description: this.description,
      profile: this.profile,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPISettingsProfile[]): SettingsProfileModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPISettingsProfile) => SettingsProfileModel.deserialize(apiData))
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
