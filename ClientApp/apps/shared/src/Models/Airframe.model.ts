import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIAirframe } from '../Interfaces';

@modelProtection
export class AirframeModel extends CoreModel {
  serialNumber: string = null;
  maxTakeOffWeight: number;
  cappsId: number;

  constructor(data?: Partial<AirframeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirframe): AirframeModel {
    if (!apiData) {
      return new AirframeModel();
    }
    const data: Partial<AirframeModel> = {
      ...apiData,
      serialNumber: apiData.serialNumber,
      maxTakeOffWeight: apiData.airframeWeightAndLength?.maxTakeOffWeight,
      cappsId: apiData.aircraftVariation?.cappsId,
    };
    return new AirframeModel(data);
  }
}
