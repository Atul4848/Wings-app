import { IAPIExitFormRequirement } from '../Interfaces';
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

@modelProtection
export class ExitFormRequirementModel extends CoreModel implements ISelectOption {
  id: number = 0;
  formLeadTime: number = null;
  formInstructions: string = '';
  healthForm: SettingsTypeModel;
  link: string = '';
  tempId: number = Utilities.getTempId(true);

  constructor(data?: Partial<ExitFormRequirementModel>) {
    super(data);
    Object.assign(this, data);
    this.healthForm = new SettingsTypeModel(data?.healthForm);
  }

  static deserialize(apiData: IAPIExitFormRequirement): ExitFormRequirementModel {
    if (!apiData) {
      return new ExitFormRequirementModel();
    }
    const data: Partial<ExitFormRequirementModel> = {
      ...apiData,
      id: apiData.exitFormsRequiredId || apiData.id,
      healthForm: SettingsTypeModel.deserialize({ id: apiData.healthForm?.healthFormId, ...apiData.healthForm }),
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new ExitFormRequirementModel(data);
  }

  public serialize(): IAPIExitFormRequirement {
    return {
      id: this.id,
      formInstructions: this.formInstructions,
      formLeadTime: Utilities.getNumberOrNullValue(this.formLeadTime),
      healthFormId: this.healthForm?.id || null,
      accessLevelId: this.accessLevel.id,
      link: this.link,
    };
  }

  static deserializeList(apiDataList: IAPIExitFormRequirement[]): ExitFormRequirementModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIExitFormRequirement) => ExitFormRequirementModel.deserialize(apiData))
      : [];
  }

  public isIdExist(data: ExitFormRequirementModel): boolean {
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
