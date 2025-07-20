import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  modelProtection,
} from '@wings-shared/core';
import { IAPIAirport } from '../Interfaces';

@modelProtection
export class RestrictionsAirportModel extends CoreModel implements ISelectOption {
  icao: string = '';

  constructor(data?: Partial<RestrictionsAirportModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirport): RestrictionsAirportModel {
    if (!apiData) {
      return new RestrictionsAirportModel();
    }
    const data: Partial<RestrictionsAirportModel> = {
      id: apiData.airportId || apiData.id,
      icao: apiData.icao,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new RestrictionsAirportModel(data);
  }

  static deserializeList(apiList: IAPIAirport[]): RestrictionsAirportModel[] {
    return apiList ? apiList.map((apiData: IAPIAirport) => RestrictionsAirportModel.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.icao;
  }

  public get value(): string | number {
    return this.id || this.icao;
  }
}
