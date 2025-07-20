import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIUWAAllowableAction } from '../Interfaces';

@modelProtection
export class UWAAllowableActionModel extends CoreModel implements ISelectOption {
  isEditable: boolean = false;
  summaryDescription: string = '';

  constructor(data?: Partial<UWAAllowableActionModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIUWAAllowableAction): UWAAllowableActionModel {
    if (!apiData) {
      return new UWAAllowableActionModel();
    }
    return new UWAAllowableActionModel({ ...apiData });
  }

  static deserializeList(apiDataList: IAPIUWAAllowableAction[]): UWAAllowableActionModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIUWAAllowableAction) => UWAAllowableActionModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIUWAAllowableAction {
    return {
      ...this._serialize(),
      id: this.id,
      name: this.name,
      isEditable: this.isEditable,
      summaryDescription: this.summaryDescription,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
