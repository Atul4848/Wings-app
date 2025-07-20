import { CoreModel, DepartureAirportModel, DepartureHandlerModel } from './index';
import { IAPIDepartureLogisticsData } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class DepartureLogisticsDataModel extends CoreModel {
  airport: DepartureAirportModel;
  handler: DepartureHandlerModel;

  constructor(data?: Partial<DepartureLogisticsDataModel>) {
    super();
    Object.assign(this, data);
    this.airport = new DepartureAirportModel(data?.airport);
    this.handler = new DepartureHandlerModel(data?.handler);
  }

  static deserialize(apiData: IAPIDepartureLogisticsData): DepartureLogisticsDataModel {
    if (!apiData) {
      return new DepartureLogisticsDataModel();
    }

    const data: Partial<DepartureLogisticsDataModel> = {
      airport: DepartureAirportModel.deserialize(apiData.AirportData),
      handler: DepartureHandlerModel.deserialize(apiData.HandlerData),
    };

    return new DepartureLogisticsDataModel(data);
  }
}
