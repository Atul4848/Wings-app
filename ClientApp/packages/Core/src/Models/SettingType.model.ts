import { MODEL_STATUS } from '../Enums';
import { modelProtection } from '../Decorators';
import { ISelectOption, IBaseApiResponse } from '../Interfaces';
import { CoreModel } from './Core.model';

@modelProtection
export class SettingsTypeModel extends CoreModel implements ISelectOption {
  summaryDescription: string = '';

  constructor(data?: Partial<SettingsTypeModel>) {
    super();
    Object.assign(this, data);
    this.accessLevelId = data?.accessLevelId || 1;
  }

  static deserialize(apiStateType: IBaseApiResponse): SettingsTypeModel {
    if (!apiStateType) {
      return new SettingsTypeModel();
    }

    return new SettingsTypeModel({ ...apiStateType });
  }

  static deserializeList(apiDataList: IBaseApiResponse[], idKey?: string): SettingsTypeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IBaseApiResponse) =>
          SettingsTypeModel.deserialize({ ...apiData, id: apiData[idKey] || apiData.id })
        )
      : [];
  }

  public serialize(): IBaseApiResponse {
    return {
      id: this.id,
      name: this.name,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value || MODEL_STATUS.ACTIVE,
    };
  }

  public serializeSummary(): IBaseApiResponse {
    return {
      ...this.serialize(),
      summaryDescription: this.summaryDescription,
    };
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
