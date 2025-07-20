import { CoreModel, CiqCrewPaxDataModel } from './index';
import { IAPICiqAirport } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqAirportModel extends CoreModel {
  approved: CiqCrewPaxDataModel;
  unApproved: CiqCrewPaxDataModel;

  constructor(data?: Partial<CiqAirportModel>) {
    super();
    Object.assign(this, data);
    this.approved = new CiqCrewPaxDataModel(data?.approved);
    this.unApproved = new CiqCrewPaxDataModel(data?.unApproved);
  }

  static deserialize(apiData: IAPICiqAirport): CiqAirportModel {
    if (!apiData) {
      return new CiqAirportModel();
    }

    const data: Partial<CiqAirportModel> = {
      approved: CiqCrewPaxDataModel.deserialize(apiData.ApprovedData),
      unApproved: CiqCrewPaxDataModel.deserialize(apiData.StageData),
    };

    return new CiqAirportModel(data);
  }
}
