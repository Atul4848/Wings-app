import { CoreModel, ArrivalLogisticsDataModel, SurveyModel } from './index';
import { IAPIArrivalLogistics } from './../Interfaces/API-ArrivalLogistics.interface';
import { IApprovalFlag } from '../Interfaces';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class ArrivalLogisticsModel extends CoreModel {
  airportHandlerId: number = null;
  airportId: number = null;
  approved: ArrivalLogisticsDataModel;
  unApproved: ArrivalLogisticsDataModel;
  reviewStatus: string = '';
  surveyInfo: SurveyModel;

  constructor(data?: Partial<ArrivalLogisticsModel>) {
    super();
    Object.assign(this, data);
    this.approved = new ArrivalLogisticsDataModel(data?.approved);
    this.unApproved = new ArrivalLogisticsDataModel(data?.unApproved);
    this.surveyInfo = new SurveyModel(data?.surveyInfo);
  }

  private getStatus(key: string): IApprovalFlag {
    return this.unApproved.status[key];
  }

  static deserialize(apiData: IAPIArrivalLogistics): ArrivalLogisticsModel {
    if (!apiData) {
      return new ArrivalLogisticsModel();
    }

    const data: Partial<ArrivalLogisticsModel> = {
      airportHandlerId: apiData.AirportHandlerId,
      airportId: apiData.AirportId,
      approved: ArrivalLogisticsDataModel.deserialize(apiData.ApprovedData.ArrivalLogistics),
      unApproved: ArrivalLogisticsDataModel.deserialize(apiData.StageData.ArrivalLogistics),
      reviewStatus: apiData.ReviewStatus,
      surveyInfo: SurveyModel.deserialize(apiData.SurveyInfo),
    };


    return new ArrivalLogisticsModel(data);
  }

  public ApiModel(username: string): object {
    const response = {
      Stage: {
        ArrivalLogistics:{
          WalkDistance: this.getApprovedValue(
            this.unApproved.walkDistance,
            this.getStatus('walkDistance').isApproved,
          ),
          RampSideShuttleAvailable: this.getApprovedValue(
            this.unApproved.rampSideShuttleAvailable,
            this.getStatus('rampSideShuttleAvailable').isApproved,
          ),
          ArrivalExpectedProcedures: this.getApprovedValue(
            this.unApproved.arrivalExpectedProcedures,
            this.getStatus('arrivalExpectedProcedures').isApproved,
          ),
          DisabilitiesAccomomodationAvailability: this.getApprovedValue(
            this.unApproved.disabilitiesAccomomodationAvailability,
            this.getStatus('disabilitiesAccomomodationAvailability').isApproved
          ),
          ArrivalCrewPaxPassportHandling: this.getApprovedValue(
            this.unApproved.arrivalCrewPassengerPassportHandling,
            this.getStatus('arrivalCrewPassengerPassportHandling').isApproved
          ),
          ArrivalLuggageHandling: this.getApprovedValue(
            this.unApproved.arrivalLuggageHandling,
            this.getStatus('arrivalLuggageHandling').isApproved
          ),
          ArrivalMeetingPoint: this.getApprovedValue(
            this.unApproved.arrivalMeetingPoint,
            this.getStatus('arrivalMeetingPoint').isApproved
          ),
          ArrivalAddress: this.getApprovedValue(
            this.unApproved.arrivalAddress,
            this.getStatus('arrivalAddress').isApproved
          ),
          AdditionalInstructionsForGate: this.getApprovedValue(
            this.unApproved.additionalInstructionsForGate,
            this.getStatus('additionalInstructionsForGate').isApproved
          ),
        },
      },
      Ignored: {
        ArrivalLogistics: {
          RampSideShuttleAvailable: this.getIgnoredValue(
            this.approved.rampSideShuttleAvailable,
            this.getStatus('rampSideShuttleAvailable').isIgnored
          ),
          ArrivalExpectedProcedures: this.getIgnoredValue(
            this.approved.arrivalExpectedProcedures,
            this.getStatus('arrivalExpectedProcedures').isIgnored
          ),
          DisabilitiesAccomomodationAvailability: this.getIgnoredValue(
            this.approved.disabilitiesAccomomodationAvailability,
            this.getStatus('disabilitiesAccomomodationAvailability').isIgnored
          ),
          ArrivalCrewPaxPassportHandling: this.getIgnoredValue(
            this.approved.arrivalCrewPassengerPassportHandling,
            this.getStatus('arrivalCrewPassengerPassportHandling').isIgnored
          ),
          ArrivalLuggageHandling: this.getIgnoredValue(
            this.approved.arrivalLuggageHandling,
            this.getStatus('arrivalLuggageHandling').isIgnored
          ),
          ArrivalMeetingPoint: this.getIgnoredValue(
            this.approved.arrivalMeetingPoint,
            this.getStatus('arrivalMeetingPoint').isIgnored
          ),
          ArrivalAddress: this.getIgnoredValue(
            this.approved.arrivalAddress,
            this.getStatus('arrivalAddress').isIgnored
          ),
          AdditionalInstructionsForGate: this.getIgnoredValue(
            this.approved.additionalInstructionsForGate,
            this.getStatus('additionalInstructionsForGate').isIgnored
          ),
        },
      },
      AirportLogisticsStageId: this.unApproved.airportLogisticsStageId,
      AirportHandlerId: this.airportHandlerId,
      AirportId: this.airportId,
      ApprovedUser: username,
    };
    return response;
  }
}

