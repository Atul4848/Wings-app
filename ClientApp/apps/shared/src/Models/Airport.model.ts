import { IAPIAirport } from '../Interfaces';
import { modelProtection, MODEL_STATUS, CoreModel, ISelectOption, IdNameCodeModel } from '@wings-shared/core';

@modelProtection
export class AirportModel extends CoreModel implements ISelectOption {
  icao: IdNameCodeModel = null;
  uwaCode: string = '';
  iataCode: string = '';
  faaCode: string = '';
  regionalCode: string = '';
  displayCode: string = '';
  // Note: Only used in Permit Exception RULES on other places use icao object
  icaoOrUwaCode: string = '';

  constructor(data?: Partial<AirportModel>) {
    super(data);
    Object.assign(this, data);
    this.icao = data?.icao ? new IdNameCodeModel(data?.icao) : null;
  }

  static deserialize(apiData: IAPIAirport): AirportModel {
    if (!apiData) {
      return new AirportModel();
    }
    return new AirportModel({
      ...apiData,
      ...this.deserializeAuditFields(apiData),
      icaoOrUwaCode: apiData.icaoCode?.code || apiData.uwaCode,
      name: apiData.commonName || apiData.name,
      id: apiData.airportId || apiData.id,
      icao: IdNameCodeModel.deserialize({
        id: apiData.icaoCode?.icaoCodeId,
        code: apiData.icaoCode?.icaoCode || apiData.icaoCode?.code || apiData.icao || apiData.regionalCode,
      }),
    });
  }

  static deserializeList(apiList: IAPIAirport[]): AirportModel[] {
    return apiList ? apiList.map((apiData: IAPIAirport) => AirportModel.deserialize(apiData)) : [];
  }

  public get inactive(): boolean {
    return this.status?.id === MODEL_STATUS.IN_ACTIVE;
  }

  public get label(): string {
    // Permit Exceptions
    if (this.icaoOrUwaCode && this.name) {
      return `${this.name} (${this.icaoOrUwaCode})`;
    }

    // All other cases
    if (this.icao?.code && this.name) {
      return `${this.name} (${this.icao?.code})`;
    }
    if (this.uwaCode && this.name) {
      return `${this.name} (${this.uwaCode})`;
    }
    //This is added for schedule restriction entity option mapping
    if (this.displayCode && this.name) {
      return `${this.name} (${this.displayCode})`;
    }
    return this.name || this.icao?.code || this.uwaCode || this.icaoOrUwaCode || this.iataCode || this.displayCode;
  }

  public get value(): string {
    return this.displayCode || this.icao?.code || this.icaoOrUwaCode || this.iataCode;
  }

  // Operation Code for Airport hours
  public get operationalCode(): string {
    return this.displayCode || this.icao?.code || this.uwaCode || this.regionalCode;
  }
}
