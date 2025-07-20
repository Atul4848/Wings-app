import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIICAOCode } from '../Interfaces';

@modelProtection
export class ICAOCodeModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code: string = '';

  constructor(data?: Partial<ICAOCodeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIICAOCode): ICAOCodeModel {
    if (!apiData) {
      return new ICAOCodeModel();
    }
    return new ICAOCodeModel({
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.icaoCodeId || apiData.id,
    });
  }

  static deserializeList(apiDataList: IAPIICAOCode[]): ICAOCodeModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIICAOCode) => ICAOCodeModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPIICAOCode {
    return {
      ...this._serialize(),
      id: this.id,
      code: this.code,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.code;
  }

  public get value(): number {
    return this.id;
  }
}
