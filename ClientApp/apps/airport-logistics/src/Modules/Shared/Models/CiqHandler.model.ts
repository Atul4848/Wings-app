import { CoreModel, CiqHandlerDataModel } from './index';
import { IAPICiqHandler } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqHandlerModel extends CoreModel {
  approved: CiqHandlerDataModel;
  unApproved: CiqHandlerDataModel;

  constructor(data?: Partial<CiqHandlerModel>) {
    super();
    this.approved = new CiqHandlerDataModel(data?.approved);
    this.unApproved = new CiqHandlerDataModel(data?.unApproved);
  }

  static deserialize(apiData: IAPICiqHandler): CiqHandlerModel {
    if (!apiData) {
      return new CiqHandlerModel();
    }

    const data: Partial<CiqHandlerModel> = {
      approved: CiqHandlerDataModel.deserialize(apiData.ApprovedData),
      unApproved: CiqHandlerDataModel.deserialize(apiData.StageData),
    };

    return new CiqHandlerModel(data);
  }
}
