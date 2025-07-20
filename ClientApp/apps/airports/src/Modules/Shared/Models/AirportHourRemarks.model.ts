import { AirportHoursSubTypeModel } from './AirportHourSubType.model';
import { IAPIAirportHoursRemarks } from '../Interfaces';
import { AirportHoursTypeModel } from './AirportHourType.model';
import { ISelectOption, SettingsTypeModel } from '@wings-shared/core';

export class AirportHourRemarksModel extends SettingsTypeModel implements ISelectOption {
  id: number = 0;
  airportHoursSubType: AirportHoursSubTypeModel;
  sequenceId: number = null;
  airportHoursType: AirportHoursTypeModel;

  constructor(data?: Partial<AirportHourRemarksModel>) {
    super(data);
    Object.assign(this, data);
    this.airportHoursType = new AirportHoursTypeModel(data?.airportHoursType);
    this.airportHoursSubType = new AirportHoursSubTypeModel(data?.airportHoursSubType);
  }

  static deserialize(apiData: IAPIAirportHoursRemarks): AirportHourRemarksModel {
    if (!apiData) {
      return new AirportHourRemarksModel();
    }
    const data: Partial<AirportHourRemarksModel> = {
      ...apiData,
      id: apiData.airportHoursRemarkId || apiData?.id,
      airportHoursSubType: AirportHoursSubTypeModel.deserialize({
        id: apiData.airportHoursSubTypeId || apiData.airportHoursSubType?.airportHoursSubTypeId,
        name: apiData.airportHoursSubType?.name,
        airportHoursTypeId: apiData.airportHoursSubType.airportHoursTypeId,
        sequenceId: apiData.airportHoursSubType?.sequenceId,
        description: apiData.airportHoursSubType.description,
      }),
      airportHoursType: AirportHoursTypeModel.deserialize(apiData?.airportHoursType),
    };
    return new AirportHourRemarksModel(data);
  }

  static deserializeList(airportHoursRemarksList: IAPIAirportHoursRemarks[]): AirportHourRemarksModel[] {
    return airportHoursRemarksList
      ? airportHoursRemarksList.map((airportHoursRemarks: IAPIAirportHoursRemarks) =>
        AirportHourRemarksModel.deserialize(airportHoursRemarks)
      )
      : [];
  }

  public serialize(): IAPIAirportHoursRemarks {
    const data: IAPIAirportHoursRemarks = {
      id: this.id,
      name: this.name,
      sequenceId: this.sequenceId,
      airportHoursSubTypeId: this.airportHoursSubType?.id,
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
