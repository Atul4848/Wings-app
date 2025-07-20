import { LogisticsComponentModel } from './index';
import { ApprovalStatus, IAPIArrivalLogisticsData } from '../Interfaces/index';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class ArrivalLogisticsDataModel extends StatusModel {
  walkDistance: string = ''; // unapproved only.
  walkDistanceMeters: number = null;
  walkDistanceOperand: string = '';
  arrivalExpectedProcedures: LogisticsComponentModel[] = [];
  airportLogisticsStageId: number = null;
  rampSideShuttleAvailable: string = '';
  disabilitiesAccomomodationAvailability: LogisticsComponentModel[] = [];
  arrivalCrewPassengerPassportHandling: LogisticsComponentModel[] = [];
  arrivalLuggageHandling: LogisticsComponentModel[] = [];
  arrivalMeetingPoint: LogisticsComponentModel[] = [];
  arrivalAddress: string = '';
  additionalInstructionsForGate: string = '';

  constructor(data?: Partial<ArrivalLogisticsDataModel>) {
    super();
    Object.assign(this, data);
    this.status = data?.status || this.approvalStatus;
  }

  public get rampSideShuttleLabel(): string {
    return this.getYesOrNoLabel(Boolean(this.rampSideShuttleAvailable));
  }

  public get walkDistancePair(): string {
    if(this.walkDistanceMeters === 300 && this.walkDistanceOperand === '<')
      return 'Less than 5 min walk (300m approx.)';
    else if(this.walkDistanceMeters === 500 && this.walkDistanceOperand === '=')
      return 'About 5-10 min walk (500m approx.)';
    else if(this.walkDistanceMeters === 1000 && this.walkDistanceOperand === '=')
      return 'About 10-15 min walk (1000m approx.)';
    else if(this.walkDistanceMeters === 1000 && this.walkDistanceOperand === '>')
      return 'More than a 15 min walk (more than 1000m)';
    return '';
  }

  public get approvalStatus(): ApprovalStatus {
    return {
      rampSideShuttleAvailable:{
        isApproved: false,
        isIgnored: false,
      },
      arrivalExpectedProcedures:{
        isApproved: false,
        isIgnored: false,
      },
      disabilitiesAccomomodationAvailability:{
        isApproved: false,
        isIgnored: false,
      },
      arrivalCrewPassengerPassportHandling:{
        isApproved: false,
        isIgnored: false,
      },
      arrivalLuggageHandling:{
        isApproved: false,
        isIgnored: false,
      },
      arrivalMeetingPoint:{
        isApproved: false,
        isIgnored: false,
      },
      arrivalAddress:{
        isApproved: false,
        isIgnored: false,
      },
      additionalInstructionsForGate:{
        isApproved: false,
        isIgnored: false,
      },
      walkDistance:{
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  static deserialize(apiData: IAPIArrivalLogisticsData): ArrivalLogisticsDataModel {
    if (!apiData) {
      return new ArrivalLogisticsDataModel();
    }
    
    const data: Partial<ArrivalLogisticsDataModel> = {
      walkDistance: apiData.WalkDistance,
      walkDistanceMeters: apiData.WalkDistanceMeters,
      walkDistanceOperand: apiData.WalkDistanceOperand,
      arrivalExpectedProcedures: LogisticsComponentModel.deserializeList(apiData.ArrivalExpectedProcedures),
      airportLogisticsStageId: apiData.AirportLogisticsStageId,
      rampSideShuttleAvailable: apiData.RampSideShuttleAvailable,
      disabilitiesAccomomodationAvailability: LogisticsComponentModel.deserializeList(
        apiData.DisabilitiesAccomomodationAvailability),
      arrivalCrewPassengerPassportHandling: LogisticsComponentModel.deserializeList(
        apiData.ArrivalCrewPaxPassportHandling),
      arrivalLuggageHandling: LogisticsComponentModel.deserializeList(apiData.ArrivalLuggageHandling),
      arrivalMeetingPoint: LogisticsComponentModel.deserializeList(apiData.ArrivalMeetingPoint),
      arrivalAddress: apiData.ArrivalAddress,
      additionalInstructionsForGate: apiData.AdditionalInstructionsForGate,
    };

    return new ArrivalLogisticsDataModel(data);
  }
}

