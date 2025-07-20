import { IAPIAirportHoursBuffer } from '../Interfaces';
import { AirportHoursBufferSubTypeModel } from './AirportHoursBufferSubType.model';
import { AirportHoursTypeModel } from './AirportHourType.model';
import { ISelectOption, SettingsTypeModel } from '@wings-shared/core';

export class AirportHoursBufferModel extends SettingsTypeModel implements ISelectOption {
  id: number = 0;
  buffer: number = 0;
  airportHoursTypeId: number = 0;
  airportHoursBufferSubTypeId: number = 0;
  airportHoursType: AirportHoursTypeModel;
  airportHoursBufferSubType: AirportHoursBufferSubTypeModel;

  constructor(data?: Partial<AirportHoursBufferModel>) {
    super(data);
    Object.assign(this, data);
    this.airportHoursType = new AirportHoursTypeModel(data?.airportHoursType);
    this.airportHoursBufferSubType = new AirportHoursBufferSubTypeModel(data?.airportHoursBufferSubType);
  }

  static deserialize(apiData: IAPIAirportHoursBuffer): AirportHoursBufferModel {
    if (!apiData) {
      return new AirportHoursBufferModel();
    }
    const data: Partial<AirportHoursBufferModel> = {
      ...apiData,
      id: apiData?.airportHoursBufferId || apiData?.id,
      buffer: apiData.buffer,
      airportHoursBufferSubType: AirportHoursBufferSubTypeModel.deserialize(apiData?.airportHoursBufferSubType),
      airportHoursType: AirportHoursTypeModel.deserialize(apiData?.airportHoursType),
    };
    return new AirportHoursBufferModel(data);
  }

  static deserializeList(airportHourBuffersList: IAPIAirportHoursBuffer[]): AirportHoursBufferModel[] {
    return airportHourBuffersList
      ? airportHourBuffersList.map((airportHourBuffers: IAPIAirportHoursBuffer) =>
        AirportHoursBufferModel.deserialize(airportHourBuffers)
      )
      : [];
  }

  public serialize(): IAPIAirportHoursBuffer {
    const data: IAPIAirportHoursBuffer = {
      ...this._serialize(),
      id: this.id,
      buffer: this.buffer,
      airportHoursTypeId: this.airportHoursType.id,
      airportHoursBufferSubTypeId: this.airportHoursBufferSubType.id,
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
