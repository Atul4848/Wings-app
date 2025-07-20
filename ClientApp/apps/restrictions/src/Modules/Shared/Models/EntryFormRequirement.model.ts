import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPIEntryFormRequirement } from '../Interfaces';

@modelProtection
export class EntryFormRequirementModel extends CoreModel implements ISelectOption {
  id: number = 0;
  healthFormLink: string = '';
  instructions: string = '';
  leadTime: number = null;
  healthForm: SettingsTypeModel;
  tempId: number = Utilities.getTempId(true);

  constructor(data?: Partial<EntryFormRequirementModel>) {
    super(data);
    Object.assign(this, data);
    this.accessLevel = new AccessLevelModel(data?.accessLevel || { id: 2, name: 'Private' });
    this.healthForm = new SettingsTypeModel(data?.healthForm);
  }

  static deserialize(apiData: IAPIEntryFormRequirement): EntryFormRequirementModel {
    if (!apiData) {
      return new EntryFormRequirementModel();
    }
    const data: Partial<EntryFormRequirementModel> = {
      ...apiData,
      id: apiData.formRequirementId || apiData.id,
      healthForm: SettingsTypeModel.deserialize({ ...apiData?.healthForm, id: apiData.healthForm.healthFormId }),
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new EntryFormRequirementModel(data);
  }

  public serialize(): IAPIEntryFormRequirement {
    return {
      id: this.id,
      accessLevelId: this.accessLevel?.id,
      healthFormLink: this.healthFormLink,
      instructions: this.instructions,
      leadTime: this.leadTime || 0,
      healthFormId: this.healthForm?.id,
    };
  }

  static deserializeList(apiDataList: IAPIEntryFormRequirement[]): EntryFormRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIEntryFormRequirement) => EntryFormRequirementModel.deserialize(apiData))
      : [];
  }

  public isIdExist(data: EntryFormRequirementModel): boolean {
    return Boolean(this.id) ? Utilities.isEqual(this.id, data.id) : Utilities.isEqual(this.tempId, data.tempId);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
