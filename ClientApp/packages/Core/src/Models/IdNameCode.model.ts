import { CoreModel } from './Core.model';
import { IAPIIdNameCode, ISelectOption } from '../Interfaces';
import { modelProtection } from '../Decorators';

@modelProtection
export class IdNameCodeModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code: string = '';

  constructor(data?: Partial<IdNameCodeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIIdNameCode): IdNameCodeModel {
    if (!apiData) {
      return new IdNameCodeModel();
    }
    const data: Partial<IdNameCodeModel> = {
      ...apiData,
    };
    return new IdNameCodeModel(data);
  }

  public serialize(): IAPIIdNameCode {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
    };
  }

  static deserializeList(apiDataList: IAPIIdNameCode[]): IdNameCodeModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIIdNameCode) => IdNameCodeModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    if (this.name && this.code) {
      return `${this.name}(${this.code})`;
    }
    return this.name || this.code;
  }

  public get value(): string | number {
    return this.id;
  }
}
