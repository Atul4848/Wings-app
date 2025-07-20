import { HandlerHoursModel } from './index';
import { ApprovalStatus, IAPICiqHandlerData } from './../Interfaces/index';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqHandlerDataModel extends StatusModel {
  airportLogisticsStageId: number = null;
  ciqHoursForGATOrFBO: HandlerHoursModel;
  privateFBOOperatingHours: HandlerHoursModel;

  constructor(data?: Partial<CiqHandlerDataModel>) {
    super();
    Object.assign(this, data);
    this.ciqHoursForGATOrFBO = new HandlerHoursModel(data?.ciqHoursForGATOrFBO);
    this.privateFBOOperatingHours = new HandlerHoursModel(data?.privateFBOOperatingHours);
    this.status = data?.status || this.approvalStatus;
  }

  private get approvalStatus(): ApprovalStatus {
    return {
      ciqHoursForGATOrFBO: {
        isApproved: false,
        isIgnored: false,
      },
      privateFBOOperatingHours: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  static deserialize(apiData: IAPICiqHandlerData): CiqHandlerDataModel {
    if (!apiData) {
      return new CiqHandlerDataModel();
    }

    const data: Partial<CiqHandlerDataModel> = {
      airportLogisticsStageId: apiData.AirportLogisticsStageId,
      ciqHoursForGATOrFBO: HandlerHoursModel.deserialize(apiData.CIQHoursForGATOrFBO),
      privateFBOOperatingHours: HandlerHoursModel.deserialize(apiData.PrivateFBOOperatingHours),
    };

    return new CiqHandlerDataModel(data);
  }
}
