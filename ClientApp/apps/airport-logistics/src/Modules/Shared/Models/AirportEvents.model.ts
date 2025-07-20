import { EventModel, EventsHandlerInfoModel, SurveyModel } from './index';
import { ApprovalStatus, IAPIAirportEvents, IAPIEvent, IApprovalFlag } from './../Interfaces/index';
import { StatusModel } from './Status.model';
import moment from 'moment';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class AirportEventsModel extends StatusModel {
  airportHandlerId: number = null;
  airportId: number = null;
  approvedHandlerInfo: EventsHandlerInfoModel;
  unApprovedHandlerInfo: EventsHandlerInfoModel;
  stageEvents: EventModel[] = [];
  approvedEvents: EventModel[] = [];
  reviewStatus: string = '';
  surveyInfo: SurveyModel;

  constructor(data?: Partial<AirportEventsModel>) {
    super();
    Object.assign(this, data);
    this.approvedHandlerInfo = new EventsHandlerInfoModel(data?.approvedHandlerInfo);
    this.unApprovedHandlerInfo = new EventsHandlerInfoModel(data?.unApprovedHandlerInfo);
    this.surveyInfo = new SurveyModel(data?.surveyInfo);
    this.status = data?.status || this.approvalStatus;
  }

  private getStatus(key: string): IApprovalFlag {
    return this.unApprovedHandlerInfo.status[key];
  }

  private get pertinentInfoValue(): string {
    return this.approvedHandlerInfo.pertinentInfo ? this.approvedHandlerInfo.pertinentInfo : null;
  }

  private get airportLogisticsStageId(): number {
    return this.surveyInfo.id;
  }

  private get approvalStatus(): ApprovalStatus {
    return {
      stageEvents: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  private getEvents(events: EventModel[]): IAPIEvent[] {
    return events.map(event => {
      return {
        Name: event.name,
        StartDate: moment.utc(event.startDate).toISOString(),
        EndDate: moment.utc(event.endDate).toISOString(),
        HotelShortage: event.hotelShortage,
        AirportEventId: null,
      };
    });
  }

  public ApiModel(username: string): object {
    return {
      Stage: {
        Events: this.getApprovedValue(this.getEvents(this.stageEvents), this.status['stageEvents'].isApproved),
        PertinentInfo: this.getApprovedValue(
          this.unApprovedHandlerInfo.pertinentInfo,
          this.getStatus('pertinentInfo').isApproved
        ),
      },
      Ignored: {
        Events: this.getApprovedValue(this.getEvents(this.approvedEvents), this.status['stageEvents'].isIgnored),
        PertinentInfo: this.getIgnoredValue(this.pertinentInfoValue, this.getStatus('pertinentInfo').isIgnored),
      },
      AirportLogisticsStageId: this.airportLogisticsStageId,
      AirportHandlerId: this.airportHandlerId,
      AirportId: this.airportId,
      ApprovedUser: username,
    };
  }

  static deserialize(apiData: IAPIAirportEvents): AirportEventsModel {
    if (!apiData) {
      return new AirportEventsModel();
    }

    const data: Partial<AirportEventsModel> = {
      airportHandlerId: apiData.AirportHandlerId,
      airportId: apiData.AirportId,
      approvedHandlerInfo: EventsHandlerInfoModel.deserialize(apiData.ApprovedHandlerInfo),
      unApprovedHandlerInfo: EventsHandlerInfoModel.deserialize(apiData.StageHandlerInfo),
      stageEvents: EventModel.deserializeList(apiData.StageEvents),
      approvedEvents: EventModel.deserializeList(apiData.ApprovedEvents),
      surveyInfo: SurveyModel.deserialize(apiData.SurveyInfo),
      reviewStatus: apiData.ReviewStatus,
    };

    return new AirportEventsModel(data);
  }
}
