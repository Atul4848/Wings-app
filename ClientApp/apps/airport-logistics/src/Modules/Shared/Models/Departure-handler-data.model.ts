import { LogisticsComponentModel } from './index';
import { ApprovalStatus, IAPIDepartureHandlerData } from '../Interfaces';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class DepartureHandlerDataModel extends StatusModel {
  departureHandlerLogisticsId: number = null;
  otherExpectedProcedures: string = '';
  departureAddress: string = '';
  meetingLocation: string = '';
  meetingLocationFilePath: string = '';
  departureProcedures: LogisticsComponentModel[] = [];

  constructor(data?: Partial<DepartureHandlerDataModel>) {
    super();
    Object.assign(this, data);
    this.status = data?.status || this.approvalStatus;
  }

  private get approvalStatus(): ApprovalStatus {
    return {
      otherExpectedProcedures: {
        isApproved: false,
        isIgnored: false,
      },
      departureAddress: {
        isApproved: false,
        isIgnored: false,
      },
      meetingLocation: {
        isApproved: false,
        isIgnored: false,
      },
      meetingLocationFilePath: {
        isApproved: false,
        isIgnored: false,
      },
      departureProcedures: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  static deserialize(apiData: IAPIDepartureHandlerData): DepartureHandlerDataModel {
    if (!apiData) {
      return new DepartureHandlerDataModel();
    }

    const data: Partial<DepartureHandlerDataModel> = {
      departureHandlerLogisticsId: apiData.DepartureHandlerLogisticsId,
      otherExpectedProcedures: apiData.OtherExpectedProcedures,
      departureAddress: apiData.DepartureAddress,
      meetingLocation: apiData.MeetingLocation,
      meetingLocationFilePath: apiData.MeetingLocationFilePath,
      departureProcedures: LogisticsComponentModel.deserializeList(apiData.DepartureProcedures),
    };

    return new DepartureHandlerDataModel(data);
  }
}
