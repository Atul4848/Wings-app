import { AirportModel } from '@wings/shared';
import { IAPIUAOffices } from './../Interfaces';
import { CoreModel, StatusTypeModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class UAOfficesModel extends CoreModel {
  airport: AirportModel = null;

  constructor(data?: Partial<UAOfficesModel>) {
    super(data);
    Object.assign(this, data);
    this.airport = data?.airport?.id ? new AirportModel(data?.airport) : null;
  }

  static deserialize(apiData: IAPIUAOffices): UAOfficesModel {
    if (!apiData) {
      return new UAOfficesModel();
    }
    return new UAOfficesModel({
      ...apiData,
      name: apiData.name,
      id: apiData.uaOfficeId || apiData.id,
      airport: AirportModel.deserialize(apiData.airport),
      status: StatusTypeModel.deserialize(apiData.status),
    });
  }

  static deserializeList(apiDataList: IAPIUAOffices[]): UAOfficesModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIUAOffices) => UAOfficesModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPIUAOffices {
    return {
      ...this._serialize(),
      id: this.id,
      name: this.name,
      airportId: this.airport?.id,
      airportName: this.airport?.name,
      icaoCodeId: this.airport?.icao?.id,
      icaoCode: this.airport?.icao?.code,
      uwaCode: this.airport?.uwaCode,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
