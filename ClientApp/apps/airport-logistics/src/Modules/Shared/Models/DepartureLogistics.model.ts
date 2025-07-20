import {
  CoreModel,
  SurveyModel,
  DepartureLogisticsDataModel,
  DepartureAirportDataModel,
  DepartureHandlerModel,
  DepartureHandlerDataModel,
} from './index';
import { IAPIDepartureLogistics, IAPIPostDepartureLogistics, IApprovalFlag } from './../Interfaces';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class DepartureLogisticsModel extends CoreModel {
  airportHandlerId: number = null;
  airportId: number = null;
  logistics: DepartureLogisticsDataModel;
  reviewStatus: string = '';
  surveyInfo: SurveyModel;

  constructor(data?: Partial<DepartureLogisticsModel>) {
    super();
    Object.assign(this, data);
    this.logistics = new DepartureLogisticsDataModel(data?.logistics);
    this.surveyInfo = new SurveyModel(data?.surveyInfo);
  }

  private get airportUnApproved(): DepartureAirportDataModel {
    return this.logistics.airport.unApproved;
  }

  private get airportApproved(): DepartureAirportDataModel {
    return this.logistics.airport.approved;
  }

  private get handler(): DepartureHandlerModel {
    return this.logistics.handler;
  }

  private get handlerApproved(): DepartureHandlerDataModel {
    return this.handler.approved;
  }

  private get handlerUnApproved(): DepartureHandlerDataModel {
    return this.handler.unApproved;
  }

  private getAirportStatus(key: string): IApprovalFlag {
    return this.airportUnApproved.status[key];
  }

  private getHandlerStatus(key: string): IApprovalFlag {
    return this.handlerUnApproved.status[key];
  }

  private get airportLogisticsStageId(): number {
    return this.surveyInfo.id;
  }

  static deserialize(apiData: IAPIDepartureLogistics): DepartureLogisticsModel {
    if (!apiData) {
      return new DepartureLogisticsModel();
    }
    const data: Partial<DepartureLogisticsModel> = {
      airportHandlerId: apiData.AirportHandlerId,
      airportId: apiData.AirportId,
      logistics: DepartureLogisticsDataModel.deserialize(apiData.DepartureLogistics),
      reviewStatus: apiData.ReviewStatus,
      surveyInfo: SurveyModel.deserialize(apiData.SurveyInfo),
    };

    return new DepartureLogisticsModel(data);
  }

  public ApiModel(username: string): IAPIPostDepartureLogistics {
    const response: IAPIPostDepartureLogistics = {
      Stage: {
        DepartureLogistics: {
          CrewEarlyArrival: this.getApprovedValue(
            this.airportUnApproved.crewEarlyArrivalPair.value,
            this.getAirportStatus('crewEarlyArrivalPair').isApproved
          ),
          CrewEarlyArrivalUnit: this.getApprovedValue(
            this.airportUnApproved.crewEarlyArrivalPair.unit,
            this.getAirportStatus('crewEarlyArrivalPair').isApproved
          ),
          PaxEarlyArrival: this.getApprovedValue(
            this.airportUnApproved.paxEarlyArrivalPair.value,
            this.getAirportStatus('paxEarlyArrivalPair').isApproved
          ),
          PaxEarlyArrivalUnit: this.getApprovedValue(
            this.airportUnApproved.paxEarlyArrivalPair.unit,
            this.getAirportStatus('paxEarlyArrivalPair').isApproved
          ),
          OtherExpectedProcedures: this.getApprovedValue(
            this.handlerUnApproved.otherExpectedProcedures,
            this.getHandlerStatus('otherExpectedProcedures').isApproved
          ),
          DepartureAddress: this.getApprovedValue(
            this.handlerUnApproved.departureAddress,
            this.getHandlerStatus('departureAddress').isApproved
          ),
          MeetingLocation: this.getApprovedValue(
            this.handlerUnApproved.meetingLocation,
            this.getHandlerStatus('meetingLocation').isApproved
          ),
          MeetingLocationFilePath: this.getApprovedValue(
            this.handlerUnApproved.meetingLocationFilePath,
            this.getHandlerStatus('meetingLocationFilePath').isApproved
          ),
          DepatureExpectedProcedures: this.getApprovedValue(
            this.handlerUnApproved.departureProcedures,
            this.getHandlerStatus('departureProcedures').isApproved,
            true
          ),
        },
      },
      Ignored: {
        DepartureLogistics: {
          CrewEarlyArrivalMins: this.getIgnoredValue(
            this.airportApproved.crewEarlyArrivalMins,
            this.getAirportStatus('crewEarlyArrivalPair').isIgnored
          ),
          DepartureAddress: this.getIgnoredValue(
            this.handlerApproved.departureAddress,
            this.getHandlerStatus('departureAddress').isIgnored
          ),
          PaxEarlyArrivalMins: this.getIgnoredValue(
            this.airportApproved.paxEarlyArrivalMins,
            this.getAirportStatus('paxEarlyArrivalPair').isIgnored
          ),
          MeetingLocation: this.getIgnoredValue(
            this.handlerApproved.meetingLocation,
            this.getHandlerStatus('meetingLocation').isIgnored
          ),
          MeetingLocationFilePath: this.getIgnoredValue(
            this.handlerApproved.meetingLocationFilePath,
            this.getHandlerStatus('meetingLocationFilePath').isIgnored
          ),
          OtherExpectedProcedures: this.getApprovedValue(
            this.handlerApproved.otherExpectedProcedures,
            this.getHandlerStatus('otherExpectedProcedures').isIgnored
          ),
          DepatureExpectedProcedures: this.getIgnoredValue(
            this.handlerApproved.departureProcedures,
            this.getHandlerStatus('departureProcedures').isIgnored,
            true
          ),
        },
      },
      DepartureLogisticsId: this.airportHandlerId,
      AirportLogisticsStageId: this.airportLogisticsStageId,
      AirportHandlerId: this.airportHandlerId,
      AirportId: this.airportId,
      ApprovedUser: username,
    };
    return response;
  }
}
