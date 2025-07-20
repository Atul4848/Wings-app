import { CoreModel } from '@wings-shared/core';
import { IAPIAirportRunwayClosures, IAPIRunwayClosure } from '../Interfaces';
import { RunwayClosureModel } from './RunwayClosure.model';

export class AirportRunwayClosureModel extends CoreModel {
  runwayId: number;
  runway_Id?: string;
  runwayClosures: RunwayClosureModel[];
  airportId: number;

  constructor(data?: Partial<AirportRunwayClosureModel>) {
    super(data);
    Object.assign(this, data);
    this.runwayClosures = data?.runwayClosures ? data.runwayClosures.map(runway => new RunwayClosureModel(runway)) : [];
  }

  static deserialize(apiData: IAPIAirportRunwayClosures): AirportRunwayClosureModel {
    if (!apiData) {
      return new AirportRunwayClosureModel();
    }

    return new AirportRunwayClosureModel({
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id || apiData.runwayClosuresId,
      runwayId: apiData.runwayId,
      airportId: apiData.airportId,
      runwayClosures: apiData.runwayClosures.map((runway: IAPIRunwayClosure) => RunwayClosureModel.deserialize(runway)),
    });
  }

  static deserializeList(apiDataList: IAPIAirportRunwayClosures[]): AirportRunwayClosureModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAirportRunwayClosures) => AirportRunwayClosureModel.deserialize(apiData))
      : [];
  }
}
