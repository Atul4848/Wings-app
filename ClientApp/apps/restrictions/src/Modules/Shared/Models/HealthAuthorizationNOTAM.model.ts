import { AirportModel } from '@wings/shared';
import { CoreModel, ISelectOption, modelProtection, Utilities, IdNameCodeModel } from '@wings-shared/core';
import { IAPIHealthAuthorizationNOTAM } from '../Interfaces';

@modelProtection
export class HealthAuthorizationNOTAMModel extends CoreModel implements ISelectOption {
  notamNumber: string = '';
  affectedICAO: AirportModel;
  expiryDate: string = '';
  tempId: number = Utilities.getTempId(true);

  constructor(data?: Partial<HealthAuthorizationNOTAMModel>) {
    super(data);
    Object.assign(this, data);
    this.affectedICAO = new AirportModel(data?.affectedICAO);
  }

  static deserialize(apiData: IAPIHealthAuthorizationNOTAM): HealthAuthorizationNOTAMModel {
    if (!apiData) {
      return new HealthAuthorizationNOTAMModel();
    }
    const data: Partial<HealthAuthorizationNOTAMModel> = {
      ...apiData,
      id: apiData.healthAuthorizationNOTAMId || apiData.id,
      affectedICAO: apiData.affectedAirport
        ? new AirportModel({
          id: apiData.affectedAirport.airportId,
          icao: new IdNameCodeModel({
            id: apiData.affectedAirport.airportId,
            code: apiData.affectedAirport.code,
          }),
        })
        : new AirportModel({
          id: apiData.affectedAirportId,
          icao: new IdNameCodeModel({
            id: apiData.affectedAirportId,
            code: apiData.affectedICAOCode,
          }),
        }),
    };
    return new HealthAuthorizationNOTAMModel(data);
  }

  public serialize(): IAPIHealthAuthorizationNOTAM {
    return {
      id: this.id,
      notamNumber: this.notamNumber,
      affectedAirportId: this.affectedICAO.id,
      affectedICAOCode: this.affectedICAO.label,
      expiryDate: this.expiryDate || null,
    };
  }

  public isIdExist(data: HealthAuthorizationNOTAMModel): boolean {
    return Boolean(this.id) ? Utilities.isEqual(this.id, data.id) : Utilities.isEqual(this.tempId, data.tempId);
  }

  static deserializeList(apiDataList: IAPIHealthAuthorizationNOTAM[]): HealthAuthorizationNOTAMModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIHealthAuthorizationNOTAM) => HealthAuthorizationNOTAMModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
