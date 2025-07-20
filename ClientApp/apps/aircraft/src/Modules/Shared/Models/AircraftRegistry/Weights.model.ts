import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIWeights } from '../../Interfaces';

@modelProtection
export class WeightsModel extends CoreModel {
  bow: number = 0;
  maxLandingWeight: number = 0;
  tankCapacity: number = 0;
  zeroFuelWeight: number = 0;
  mtow: number = 0;
  constructor(data?: Partial<WeightsModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIWeights): WeightsModel {
    if (!apiData) {
      return new WeightsModel();
    }
    const data: Partial<WeightsModel> = {
      ...apiData,
    };
    return new WeightsModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
