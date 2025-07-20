import { IAPIAirport } from './../Interfaces';
import { LocationModel } from './Location.model';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class AirportModel extends CoreModel implements ISelectOption {
  airportId: number;
  timezoneRegionId: string;
  airportCode: string;
  latitudeDegrees: number;
  longitudeDegrees: number;

  // extra fields for view model
  locations?: LocationModel;

  constructor(data?: Partial<AirportModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiAirport: IAPIAirport): AirportModel {
    if (!apiAirport) {
      return new AirportModel();
    }
    const data: Partial<AirportModel> = {
      ...CoreModel.deserializeAuditFields(apiAirport),
      ...apiAirport,
    };
    return new AirportModel(data);
  }

  static deserializeList(apiPersonList: IAPIAirport[]): AirportModel[] {
    return apiPersonList ? apiPersonList.map((apiPerson: IAPIAirport) => AirportModel.deserialize(apiPerson)) : [];
  }

  // we need value and label getters for Autocomplete
  public get label(): string {
    return this.airportCode;
  }

  public get value(): string | number {
    return this.airportId;
  }
}
