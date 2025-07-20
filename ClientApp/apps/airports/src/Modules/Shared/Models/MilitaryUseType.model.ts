import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIMilitaryUseType } from '../Interfaces';

@modelProtection
export class MilitaryUseTypeModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code: string = '';

  constructor(data?: Partial<MilitaryUseTypeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIMilitaryUseType): MilitaryUseTypeModel {
    if (!apiData) {
      return new MilitaryUseTypeModel();
    }
    return new MilitaryUseTypeModel({ ...apiData });
  }

  static deserializeList(apiDataList: IAPIMilitaryUseType[]): MilitaryUseTypeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIMilitaryUseType) => MilitaryUseTypeModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIMilitaryUseType {
    return {
      ...this._serialize(),
      id: this.id,
      code: this.code,
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
