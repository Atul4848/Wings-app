import { IAPIDistance } from '../../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';
@modelProtection
export class DistanceModel extends CoreModel {
  minimumRunwayLength: number = null;

  constructor(data?: Partial<DistanceModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIDistance): DistanceModel {
    if (!apiData) {
      return new DistanceModel();
    }
    const data: Partial<DistanceModel> = {
      ...apiData,
    };
    return new DistanceModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
