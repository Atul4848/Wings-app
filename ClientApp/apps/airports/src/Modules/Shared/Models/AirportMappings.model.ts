import { IAPIAirportMappings } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';
@modelProtection
export class AirportMappingsModel extends IdNameModel {
  active: boolean;
  icao: string = '';
  apgCode: string;
  navblueCode: string;
  totalRows: number = 0;

  constructor(data?: Partial<AirportMappingsModel>) {
    super();
    Object.assign(this, data);
  }

  public static deserialize(apiData: IAPIAirportMappings): AirportMappingsModel {
    if (!apiData) {
      return new AirportMappingsModel();
    }
    const data: Partial<AirportMappingsModel> = {
      id: apiData.Id,
      active: apiData.Active,
      icao: apiData.Icao,
      apgCode: apiData.ApgCode,
      navblueCode: apiData.NavblueCode,
      totalRows: apiData.TotalRows,
    };
    return new AirportMappingsModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportMappings {
    return {
      Id: this.id ?? 0,
      Active: this.active,
      Icao: this.icao,
      ApgCode: this.apgCode,
      NavblueCode: this.navblueCode,
      TotalRows: this.totalRows,
    };
  }

  public static deserializeList(airportMappingList: IAPIAirportMappings[]): AirportMappingsModel[] { 
    return airportMappingList
      ? airportMappingList.map((airportMappings: IAPIAirportMappings) => 
        AirportMappingsModel.deserialize(airportMappings))
      : [];
  }
}
