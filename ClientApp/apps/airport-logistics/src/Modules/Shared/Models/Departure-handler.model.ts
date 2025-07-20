import { CoreModel, DepartureHandlerDataModel } from './index';
import { IAPIDepartureHandler } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class DepartureHandlerModel extends CoreModel {
  approved: DepartureHandlerDataModel;
  unApproved: DepartureHandlerDataModel;

  constructor(data?: Partial<DepartureHandlerModel>) {
    super();
    Object.assign(this, data);
    this.approved = new DepartureHandlerDataModel(data?.approved);
    this.unApproved = new DepartureHandlerDataModel(data?.unApproved);
  }

  static deserialize(apiData: IAPIDepartureHandler): DepartureHandlerModel {
    if (!apiData) {
      return new DepartureHandlerModel();
    }

    const data: Partial<DepartureHandlerModel> = {
      approved: DepartureHandlerDataModel.deserialize(apiData.ApprovedData),
      unApproved: DepartureHandlerDataModel.deserialize(apiData.StageData),
    };

    return new DepartureHandlerModel(data);
  }
}
