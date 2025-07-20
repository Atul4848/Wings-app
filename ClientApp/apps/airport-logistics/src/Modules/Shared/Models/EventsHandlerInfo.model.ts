import { ApprovalStatus, IAPIEventsHandlerInfo } from '../Interfaces/index';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class EventsHandlerInfoModel extends StatusModel {
  pertinentInfo: string = '';

  constructor(data?: Partial<EventsHandlerInfoModel>) {
    super(data);
    this.pertinentInfo = data?.pertinentInfo || '';
    this.status = data?.status || this.approvalStatus;
  }

  private get approvalStatus(): ApprovalStatus {
    return {
      pertinentInfo: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  static deserialize(apiData: IAPIEventsHandlerInfo): EventsHandlerInfoModel {
    if (!apiData) {
      return new EventsHandlerInfoModel();
    }

    const data: Partial<EventsHandlerInfoModel> = {
      pertinentInfo: apiData.PertinentInfo,
    };

    return new EventsHandlerInfoModel(data);
  }
}
