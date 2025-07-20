import { IAPIAirportHoursBufferSubType } from '../Interfaces';
import { ISelectOption, SettingsTypeModel } from '@wings-shared/core';

export class AirportHoursBufferSubTypeModel extends SettingsTypeModel implements ISelectOption {

  constructor(data?: Partial<AirportHoursBufferSubTypeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportHoursBufferSubType): AirportHoursBufferSubTypeModel {
    if (!apiData) {
      return new AirportHoursBufferSubTypeModel();
    }
    const data: Partial<AirportHoursBufferSubTypeModel> = {
      ...apiData,
      id: apiData.airportHoursBufferSubTypeId || apiData.id,
    };
    return new AirportHoursBufferSubTypeModel(data);
  }

  static deserializeList(airportHoursSubList: IAPIAirportHoursBufferSubType[]): AirportHoursBufferSubTypeModel[] {
    return airportHoursSubList
      ? airportHoursSubList.map((airportHoursSubTypes: IAPIAirportHoursBufferSubType) =>
        AirportHoursBufferSubTypeModel.deserialize(airportHoursSubTypes)
      )
      : [];
  }

  public serialize(): IAPIAirportHoursBufferSubType {
    const data: IAPIAirportHoursBufferSubType = {
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
