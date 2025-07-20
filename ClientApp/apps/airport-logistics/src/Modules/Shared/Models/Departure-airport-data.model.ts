import { ValueUnitPairModel } from './index';
import { ApprovalStatus, IAPIDepartureAirportData } from './../Interfaces';
import { StatusModel } from './Status.model';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class DepartureAirportDataModel extends StatusModel {
  id: number = null;
  crewEarlyArrivalMins: number = null;
  paxEarlyArrivalMins: number = null;
  earlyCrewArrival: string = '';
  earlyCrewArrivalUnit: string = '';
  earlyPassArrival: string = '';
  earlyPassArrivalUnit: string = '';
  crewEarlyArrivalPair: ValueUnitPairModel;
  paxEarlyArrivalPair: ValueUnitPairModel;

  constructor(data?: Partial<DepartureAirportDataModel>) {
    super();
    Object.assign(this, data);
    this.crewEarlyArrivalPair = new ValueUnitPairModel(data?.crewEarlyArrivalPair);
    this.paxEarlyArrivalPair = new ValueUnitPairModel(data?.paxEarlyArrivalPair);
    this.status = data?.status || this.approvalStatus;
  }

  public get crewEarlyArrivalLabel(): string {
    return this.crewEarlyArrivalMins ? `${this.crewEarlyArrivalMins} Minutes` : '';
  }

  public get PaxEarlyArrivalLabel(): string {
    return this.paxEarlyArrivalMins ? `${this.paxEarlyArrivalMins} Minutes` : '';
  }

  private get approvalStatus(): ApprovalStatus {
    return {
      crewEarlyArrivalPair: {
        isApproved: false,
        isIgnored: false,
      },
      paxEarlyArrivalPair: {
        isApproved: false,
        isIgnored: false,
      },
    };
  }

  static deserialize(apiData: IAPIDepartureAirportData): DepartureAirportDataModel {
    if (!apiData) {
      return new DepartureAirportDataModel();
    }

    const data: Partial<DepartureAirportDataModel> = {
      crewEarlyArrivalMins: apiData.CrewEarlyArrivalMins,
      paxEarlyArrivalMins: apiData.PaxEarlyArrivalMins,
      earlyCrewArrival: apiData.EarlyCrewArrival,
      earlyCrewArrivalUnit: apiData.EarlyCrewArrivalUnit,
      earlyPassArrival: apiData.EarlyPassArrival,
      earlyPassArrivalUnit: apiData.EarlyPassArrivalUnit,
      crewEarlyArrivalPair: ValueUnitPairModel.deserialize(apiData.EarlyCrewArrival, apiData.EarlyCrewArrivalUnit),
      paxEarlyArrivalPair: ValueUnitPairModel.deserialize(apiData.EarlyPassArrival, apiData.EarlyPassArrivalUnit),
    };

    return new DepartureAirportDataModel(data);
  }
}
