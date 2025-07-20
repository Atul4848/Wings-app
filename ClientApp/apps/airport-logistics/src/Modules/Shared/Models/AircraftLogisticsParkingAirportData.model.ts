import { ValueUnitPairModel, LogisticsComponentModel } from './index';
import { ApprovalStatus, IAPIAircraftLogisticsParkingAirportData } from '../Interfaces/index';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class AircraftLogisticsParkingAirportDataModel extends StatusModel {
  airportLogisticsStageId: number = null;
  maxParkingDurationHours: number = null;
  nearbyParkingAirports: string = '';
  overnightParkingIssue: string = '';
  parkingDurationPair: ValueUnitPairModel;
  parkingDiffMonths: LogisticsComponentModel[] = [];
  typesOfAircraftOperating: LogisticsComponentModel[] = [];
  mtow: number | string = '';
  mtowKgs: number = null;
  mtowUnits: string = '';
  mtowPair: ValueUnitPairModel;
  aircraftRestrictions: LogisticsComponentModel[] = [];
  handlerName: string = '';

  constructor(data?: Partial<AircraftLogisticsParkingAirportDataModel>) {
    super();
    Object.assign(this, data);
    this.mtowPair = new ValueUnitPairModel(data?.mtowPair);
    this.parkingDurationPair = new ValueUnitPairModel(data?.parkingDurationPair);
    this.status = data?.status || this.approvalStatus;
  }

  public get maxParkingDurationHoursLabel(): string {
    return this.maxParkingDurationHours ? `${this.maxParkingDurationHours} Hours` : '';
  }

  public get mtowKgsLabel(): string {
    return this.mtowKgs ? `${this.mtowKgs} Kgs` : '';
  }

  private get approvalStatus(): ApprovalStatus {
    return {
      nearbyParkingAirports: {
        isApproved: false,
        isIgnored: false,
      },
      overnightParkingIssue: {
        isApproved: false,
        isIgnored: false,
      },
      parkingDurationPair: {
        isApproved: false,
        isIgnored: false,
      },
      parkingDiffMonths: {
        isApproved: false,
        isIgnored: false,
      },
      typesOfAircraftOperating: {
        isApproved: false,
        isIgnored: false,
      },
      aircraftRestrictions: {
        isApproved: false,
        isIgnored: false,
      },
      mtowPair: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  static deserialize(apiData: IAPIAircraftLogisticsParkingAirportData): AircraftLogisticsParkingAirportDataModel {
    if (!apiData) {
      return new AircraftLogisticsParkingAirportDataModel();
    }

    const mtow = apiData.MTOW ? String(apiData.MTOW) : '';
    const parkingDuration = apiData.ParkingDuration ? String(apiData.ParkingDuration) : '';
    const data: Partial<AircraftLogisticsParkingAirportDataModel> = {
      airportLogisticsStageId: apiData.AirportLogisticsStageId,
      maxParkingDurationHours: apiData.MaxParkingDurationHours,
      nearbyParkingAirports: apiData.NearbyParkingAirports,
      overnightParkingIssue: apiData.OvernightParkingIssue,
      parkingDurationPair: ValueUnitPairModel.deserialize(parkingDuration, apiData.ParkingDurationUnit),
      parkingDiffMonths: LogisticsComponentModel.deserializeList(apiData.ParkingDiffMonths),
      typesOfAircraftOperating: LogisticsComponentModel.deserializeList(apiData.TypesOfAircraftOperatedInAirport),
      handlerName: apiData.HandlerName,
      aircraftRestrictions: LogisticsComponentModel.deserializeList(apiData.AircraftRestrictions),
      mtow: apiData.MTOW,
      mtowKgs: apiData.MTOWKgs,
      mtowUnits: apiData.MTOW_Units,
      mtowPair: ValueUnitPairModel.deserialize(mtow, apiData.MTOW_Units),
    };

    return new AircraftLogisticsParkingAirportDataModel(data);
  }
}
