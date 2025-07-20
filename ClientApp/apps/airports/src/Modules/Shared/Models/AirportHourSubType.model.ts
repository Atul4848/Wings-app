import { IAPIAirportHoursSubTypes } from '../Interfaces';
import { AirportHoursTypeModel } from './AirportHourType.model';
import { ISelectOption, SettingsTypeModel } from '@wings-shared/core';

export class AirportHoursSubTypeModel extends SettingsTypeModel implements ISelectOption {
  id: number = 0;
  airportHoursType: AirportHoursTypeModel;
  sequenceId: number = null;
  description: string = '';

  constructor(data?: Partial<AirportHoursSubTypeModel>) {
    super(data);
    Object.assign(this, data);
    this.airportHoursType = new AirportHoursTypeModel(data?.airportHoursType);
  }

  static deserialize(apiData: IAPIAirportHoursSubTypes): AirportHoursSubTypeModel {
    if (!apiData) {
      return new AirportHoursSubTypeModel();
    }
    const data: Partial<AirportHoursSubTypeModel> = {
      ...apiData,
      id: apiData.airportHoursSubTypeId || apiData.id,
      airportHoursType: AirportHoursTypeModel.deserialize({
        id: apiData.airportHoursTypeId || apiData.airportHoursType?.airportHoursTypeId,
        name: apiData.airportHoursType?.name,
      }),
    };
    return new AirportHoursSubTypeModel(data);
  }

  static deserializeList(airportHoursSubList: IAPIAirportHoursSubTypes[]): AirportHoursSubTypeModel[] {
    return airportHoursSubList
      ? airportHoursSubList.map((airportHoursSubTypes: IAPIAirportHoursSubTypes) =>
        AirportHoursSubTypeModel.deserialize(airportHoursSubTypes)
      )
      : [];
  }

  public serialize(): IAPIAirportHoursSubTypes {
    const data: IAPIAirportHoursSubTypes = {
      id: this.id,
      name: this.name,
      airportHoursTypeId: this.airportHoursType?.id,
      statusId: this.statusId,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      sequenceId: this.sequenceId,
      description: this.description,
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
