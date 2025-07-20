import { ISelectOption, IAPIIdCode } from '../Interfaces';
import { modelProtection } from '../Decorators';
import { CoreModel } from './Core.model';

@modelProtection
export class IDCodeModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code: string = '';

  constructor(data?: Partial<IDCodeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIIdCode): IDCodeModel {
    if (!apiData) {
      return new IDCodeModel();
    }
    return new IDCodeModel({
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id,
    });
  }

  static deserializeList(apiDataList: IAPIIdCode[]): IDCodeModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIIdCode) => IDCodeModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPIIdCode {
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
