import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIRunwaySettingsType } from '../Interfaces';

@modelProtection
export class RunwaySettingsTypeModel extends CoreModel implements ISelectOption {
  code: string = '';
  description: string = '';

  constructor(data?: Partial<RunwaySettingsTypeModel>) {
    super(data);
    Object.assign(this, data);
  }
  static deserialize(apiData: IAPIRunwaySettingsType): RunwaySettingsTypeModel {
    if (!apiData) {
      return new RunwaySettingsTypeModel();
    }
    return new RunwaySettingsTypeModel({ ...apiData });
  }

  static deserializeList(runwaySettingsTypeList: IAPIRunwaySettingsType[], idKey?: string): RunwaySettingsTypeModel[] {
    return runwaySettingsTypeList
      ? runwaySettingsTypeList.map((apiData: IAPIRunwaySettingsType) =>
        RunwaySettingsTypeModel.deserialize({ ...apiData, id: apiData[idKey] || apiData.id })
      )
      : [];
  }

  public serialize(): IAPIRunwaySettingsType {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value,
    };
  }

  public get label(): string {
    if (this.name && this.code) {
      return `${this.name} (${this.code})`;
    }
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }

  public get settingCode(): string {
    return this.code;
  }
}
