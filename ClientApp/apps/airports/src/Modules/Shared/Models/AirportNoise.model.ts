import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportNoise } from '../Interfaces';

@modelProtection
export class AirportNoiseModel extends CoreModel {
  noiseAbatementProcedure: boolean = false;
  noiseAbatementContact: number;
  
  constructor(data?: Partial<AirportNoiseModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportNoise): AirportNoiseModel {
    if (!apiData) {
      return new AirportNoiseModel();
    }
    const data: Partial<AirportNoiseModel> = {
      ...apiData,
      id: apiData.noiseId,
    };
    return new AirportNoiseModel(data);
  }

  public serialize(): IAPIAirportNoise {
    return {
      id: this.id || 0,
      noiseAbatementProcedure: this.noiseAbatementProcedure,
      noiseAbatementContact: this.noiseAbatementContact,
    };
  }
}
