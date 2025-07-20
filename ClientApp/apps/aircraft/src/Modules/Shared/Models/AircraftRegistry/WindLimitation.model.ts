import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIWindLimitation } from '../../Interfaces';

@modelProtection
export class WindLimitationModel extends CoreModel {
  maximumCrosswind: number = 0;
  maximumTailwind: number = 0;
  constructor(data?: Partial<WindLimitationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIWindLimitation): WindLimitationModel {
    if (!apiData) {
      return new WindLimitationModel();
    }
    const data: Partial<WindLimitationModel> = {
      ...apiData,
    };
    return new WindLimitationModel(data);
  }

  static deserializeList(apiDataList: IAPIWindLimitation[]): WindLimitationModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIWindLimitation) => WindLimitationModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
