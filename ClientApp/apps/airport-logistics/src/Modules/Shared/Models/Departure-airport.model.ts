import { CoreModel, DepartureAirportDataModel } from './index';
import { IAPIDepartureAirport } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class DepartureAirportModel extends CoreModel {
  approved: DepartureAirportDataModel;
  unApproved: DepartureAirportDataModel;

  constructor(data?: Partial<DepartureAirportModel>) {
    super();
    Object.assign(this, data);
    this.approved = new DepartureAirportDataModel(data?.approved);
    this.unApproved = new DepartureAirportDataModel(data?.unApproved);
  }

  static deserialize(apiData: IAPIDepartureAirport): DepartureAirportModel {
    if (!apiData) {
      return new DepartureAirportModel();
    }

    const data: Partial<DepartureAirportModel> = {
      approved: DepartureAirportDataModel.deserialize(apiData.ApprovedData),
      unApproved: DepartureAirportDataModel.deserialize(apiData.StageData),
    };

    return new DepartureAirportModel(data);
  }
}
