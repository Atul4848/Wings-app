import { IAPIAirportHoursType } from '../Interfaces';
import { ISelectOption, SettingsTypeModel } from '@wings-shared/core';

export class AirportHoursTypeModel extends SettingsTypeModel implements ISelectOption {
  constructor(data?: Partial<AirportHoursTypeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportHoursType): AirportHoursTypeModel {
    if (!apiData) {
      return new AirportHoursTypeModel();
    }
    const data: Partial<AirportHoursTypeModel> = { ...apiData, id: apiData.airportHoursTypeId || apiData.id };
    return new AirportHoursTypeModel(data);
  }

  static deserializeList(airportHoursSubList: IAPIAirportHoursType[]): AirportHoursTypeModel[] {
    return airportHoursSubList
      ? airportHoursSubList.map((airportHoursSubTypes: IAPIAirportHoursType) =>
        AirportHoursTypeModel.deserialize(airportHoursSubTypes)
      )
      : [];
  }

  public serialize(): IAPIAirportHoursType {
    const data: IAPIAirportHoursType = {
      id: this.id,
      name: this.name,
      statusId: this.statusId,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
    };
    return data;
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
