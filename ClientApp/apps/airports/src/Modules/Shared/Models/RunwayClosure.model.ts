import { AccessLevelModel, CoreModel, SourceTypeModel, StatusTypeModel } from '@wings-shared/core';
import { IAPIAirportRunwayClosure } from '../Interfaces';

export class RunwayClosureModel extends CoreModel {
  runwayId: number;
  runway_Id?: string;
  closureStartDate: string = '';
  closureEndDate: string = '';
  closureStartTime: string = '';
  closureEndTime: string = '';
  notamId: string;
  airportId: number;

  constructor(data?: Partial<RunwayClosureModel>) {
    super(data);
    Object.assign(this, data);
    this.status = new StatusTypeModel(data?.status);
    this.accessLevel = new AccessLevelModel(data?.accessLevel);
    this.sourceType = data?.sourceType ? new SourceTypeModel(data?.sourceType) : null;
  }

  static deserialize(apiData: IAPIAirportRunwayClosure): RunwayClosureModel {
    if (!apiData) {
      return new RunwayClosureModel();
    }

    return new RunwayClosureModel({
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id || apiData.runwayClosuresId,
      runwayId: apiData.runwayId,
      airportId: apiData.airportId,
      closureStartDate: apiData.closureStartDate,
      closureEndDate: apiData.closureEndDate,
      closureStartTime: apiData.closureStartTime,
      closureEndTime: apiData.closureEndTime,
      notamId: apiData.notamId,
    });
  }

  static deserializeList(apiDataList: IAPIAirportRunwayClosure[]): RunwayClosureModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAirportRunwayClosure) => RunwayClosureModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIAirportRunwayClosure {
    return {
      id: this.id || 0,
      airportId: this.airportId,
      notamId: this.notamId,
      runwayId: this.runwayId,
      closureStartDate: this.closureStartDate,
      closureEndDate: this.closureEndDate,
      closureStartTime: this.closureStartTime,
      closureEndTime: this.closureEndTime,
      ...this._serialize(),
    };
  }
}
