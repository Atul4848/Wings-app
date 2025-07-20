import { CoreModel, CiqAirportModel, CiqHandlerModel } from './index';
import { IAPICiqCrewPax } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqCrewPaxModel extends CoreModel {
  airport: CiqAirportModel;
  handler: CiqHandlerModel;

  constructor(data?: Partial<CiqCrewPaxModel>) {
    super();
    Object.assign(this, data);
    this.airport = new CiqAirportModel(data?.airport);
    this.handler = new CiqHandlerModel(data?.handler);
  }

  static deserialize(apiData: IAPICiqCrewPax): CiqCrewPaxModel {
    if (!apiData) {
      return new CiqCrewPaxModel();
    }

    const data: Partial<CiqCrewPaxModel> = {
      airport: CiqAirportModel.deserialize(apiData.AirportData),
      handler: CiqHandlerModel.deserialize(apiData.AirportHandlerData),
    };

    return new CiqCrewPaxModel(data);
  }
}
