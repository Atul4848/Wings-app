import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIUsCustomsDecal } from '../../Interfaces';

@modelProtection
export class UsCustomDecalModel extends CoreModel {
  number: number = null;
  expirationDate: string = '';

  constructor(data?: Partial<UsCustomDecalModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIUsCustomsDecal): UsCustomDecalModel {
    if (!apiData) {
      return new UsCustomDecalModel();
    }
    const data: Partial<UsCustomDecalModel> = {
      ...apiData,
    };
    return new UsCustomDecalModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
