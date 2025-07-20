import {
  CoreModel,
  SurveyModel,
  AircraftLogisticsParkingModel,
  AircraftLogisticsParkingAirportDataModel,
  AircraftLogisticsParkingHandlerModel,
  AircraftLogisticsParkingHandlerDataModel,
} from './index';
import { IAPISurveyDetails } from '../Interfaces/API-SurveyDetails';
import { IApprovalFlag, IAPIPostGroundLogistics } from '../Interfaces';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class SurveyDetailModel extends CoreModel {
  aircraftLogisticsParking: AircraftLogisticsParkingModel;
  airportHandlerId: number = null;
  airportId: number = null;
  surveyInfo: SurveyModel;
  reviewStatus: string = '';

  constructor(data?: Partial<SurveyDetailModel>) {
    super();
    Object.assign(this, data);
    this.aircraftLogisticsParking = new AircraftLogisticsParkingModel(data?.aircraftLogisticsParking);
    this.surveyInfo = new SurveyModel(data?.surveyInfo);
  }

  private get unApproved(): AircraftLogisticsParkingAirportDataModel {
    return this.aircraftLogisticsParking.airport.unApproved;
  }

  private get approved(): AircraftLogisticsParkingAirportDataModel {
    return this.aircraftLogisticsParking.airport.approved;
  }

  private get handler(): AircraftLogisticsParkingHandlerModel {
    return this.aircraftLogisticsParking.handler;
  }

  private get handlerApproved(): AircraftLogisticsParkingHandlerDataModel {
    return this.handler.approved;
  }

  private get handlerUnApproved(): AircraftLogisticsParkingHandlerDataModel {
    return this.handler.unApproved;
  }

  private getStatus(key: string): IApprovalFlag {
    return this.unApproved.status[key];
  }

  private getHandlerStatus(key: string): IApprovalFlag {
    return this.handlerUnApproved.status[key];
  }

  static deserialize(apiData: IAPISurveyDetails): SurveyDetailModel {
    if (!apiData) {
      return new SurveyDetailModel();
    }

    const data: Partial<SurveyDetailModel> = {
      aircraftLogisticsParking: AircraftLogisticsParkingModel.deserialize(apiData.AircraftGroundLogisticsAndParking),
      airportHandlerId: apiData.AirportHandlerId,
      airportId: apiData.AirportId,
      surveyInfo: SurveyModel.deserialize(apiData.SurveyInfo),
      reviewStatus: apiData.ReviewStatus,
    };

    return new SurveyDetailModel(data);
  }

  public ApiModel(username: string): IAPIPostGroundLogistics {
    const response: IAPIPostGroundLogistics = {
      Stage: {
        AirportLogistics: {
          AircraftRestrictions: this.getApprovedValue(
            this.unApproved.aircraftRestrictions,
            this.getStatus('aircraftRestrictions').isApproved,
            true
          ),
          MTOW: this.getApprovedValue(
            Number(this.unApproved.mtowPair.value),
            this.getStatus('mtowPair').isApproved,
          ), // number
          MTOWUnit: this.getApprovedValue(
            this.unApproved.mtowPair.unit,
            this.getStatus('mtowPair').isApproved,
          ), // string
          OvernightParkingIssue: this.getApprovedValue(
            this.unApproved.overnightParkingIssue,
            this.getStatus('overnightParkingIssue').isApproved,
          ),
          ParkingDuration: this.getApprovedValue(
            Number(this.unApproved.parkingDurationPair.value),
            this.getStatus('parkingDurationPair').isApproved,
          ),
          ParkingDurationUnit: this.getApprovedValue(
            this.unApproved.parkingDurationPair.unit,
            this.getStatus('parkingDurationPair').isApproved,
          ),
          NearbyParkingAirports: this.getApprovedValue(
            this.unApproved.nearbyParkingAirports ? this.unApproved.nearbyParkingAirports.split(',') : null,
            this.getStatus('nearbyParkingAirports').isApproved,
          ),
          TypesOfAircraftOperatedInAirport: this.getApprovedValue(
            this.unApproved.typesOfAircraftOperating,
            this.getStatus('typesOfAircraftOperating').isApproved,
            true
          ),
          ParkingDiffMonths: this.getApprovedValue(
            this.unApproved.parkingDiffMonths,
            this.getStatus('parkingDiffMonths').isApproved,
            true
          ),
        },
        AirportHandlerLogistics: {
          TowbarRequired: this.getApprovedValue(
            this.handlerUnApproved.towbarRequired,
            this.getHandlerStatus('towbarRequired').isApproved,
          ), // string
          FilePath: this.getApprovedValue(
            this.handlerUnApproved.aircraftLogisFile,
            this.getHandlerStatus('aircraftLogisFile').isApproved,
          ), // string
          AircraftParkingLocations: this.getApprovedValue(
            this.handlerUnApproved.aircraftParkingLocation,
            this.getHandlerStatus('aircraftParkingLocation').isApproved,
            true,
          ),
          AircraftSpotAccommodations: this.getApprovedValue(
            this.handlerUnApproved.aircraftSpotAccommodation,
            this.getHandlerStatus('aircraftSpotAccommodation').isApproved,
            true,
          ),
          AircraftTowbarRequirements: this.getApprovedValue(
            this.handlerUnApproved.aircraftTowbarRequirements,
            this.getHandlerStatus('aircraftTowbarRequirements').isApproved,
            true
          ),
          TowbarRequirementScenarios: this.getApprovedValue(
            this.handlerUnApproved.towbarRequirementScenarios,
            this.getHandlerStatus('towbarRequirementScenarios').isApproved,
            true
          ),
          AirportEquipments: this.getApprovedValue(
            this.handlerUnApproved.airportEquipments,
            this.getHandlerStatus('airportEquipments').isApproved,
            true
          ),
        },
      },
      Ignored: {
        AirportLogistics: {
          AircraftRestrictions: this.getIgnoredValue(
            this.approved.aircraftRestrictions,
            this.getStatus('aircraftRestrictions').isIgnored,
            true
          ),
          OvernightParkingIssue: this.getIgnoredValue(
            this.approved.overnightParkingIssue,
            this.getStatus('overnightParkingIssue').isIgnored
          ),
          MaxParkingDurationHours: this.getIgnoredValue(
            Number(this.approved.maxParkingDurationHours),
            this.getStatus('parkingDurationPair').isIgnored
          ),
          MTOWKgs: this.getIgnoredValue(
            Number(this.approved.mtow),
            this.getStatus('mtowPair').isIgnored,
          ), // number
          NearbyParkingAirports: this.getIgnoredValue(
            this.approved.nearbyParkingAirports ? this.approved.nearbyParkingAirports.split(',') : null,
            this.getStatus('nearbyParkingAirports').isIgnored
          ),
          TypesOfAircraftOperatedInAirport: this.getIgnoredValue(
            this.approved.typesOfAircraftOperating,
            this.getStatus('typesOfAircraftOperating').isIgnored,
            true
          ),
          ParkingDiffMonths: this.getIgnoredValue(
            this.approved.parkingDiffMonths,
            this.getStatus('parkingDiffMonths').isIgnored,
            true
          ),
        },
        AirportHandlerLogistics: {
          TowbarRequired: this.getIgnoredValue(
            this.handlerApproved.towbarRequired,
            this.getHandlerStatus('towbarRequired').isIgnored,
          ), // string */
          FilePath: this.getIgnoredValue(
            this.handlerApproved.aircraftLogisFile,
            this.getHandlerStatus('aircraftLogisFile').isIgnored,
          ), // string
          AircraftParkingLocations: this.getIgnoredValue(
            this.handlerApproved.aircraftParkingLocation,
            this.getHandlerStatus('aircraftParkingLocation').isIgnored,
            true
          ),
          AircraftSpotAccommodations: this.getIgnoredValue(
            this.handlerApproved.aircraftSpotAccommodation,
            this.getHandlerStatus('aircraftSpotAccommodation').isIgnored,
            true
          ),
          AircraftTowbarRequirements: this.getIgnoredValue(
            this.handlerApproved.aircraftTowbarRequirements,
            this.getHandlerStatus('aircraftTowbarRequirements').isIgnored,
            true
          ),
          TowbarRequirementScenarios: this.getIgnoredValue(
            this.handlerApproved.towbarRequirementScenarios,
            this.getHandlerStatus('towbarRequirementScenarios').isIgnored,
            true
          ),
          AirportEquipments: this.getIgnoredValue(
            this.handlerApproved.airportEquipments,
            this.getHandlerStatus('airportEquipments').isIgnored,
            true
          ),
        },
      },
      AirportLogisticsStageId: this.surveyInfo.id,
      AirportHandlerId: this.airportHandlerId,
      AirportId: this.airportId,
      ApprovedUser: username,
    };
    return response;
  }
}
