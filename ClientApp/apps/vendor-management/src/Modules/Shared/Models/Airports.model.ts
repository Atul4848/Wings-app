import { IAPIAirport, IAPIVMSVendorLocationComparison } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class Airports extends CoreModel implements ISelectOption {
  id: number = 0;
  airportId: number;
  airportName: string;
  icaoCode: string;
  uwaCode: string;
  faaCode: string;
  iataCode: string;
  regionalCode: string;
  displayCode: string;

  constructor(data?: Partial<Airports>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirport): Airports {
    if (!apiData) {
      return new Airports();
    }
    const data: Partial<Airports> = {
      airportId: apiData.airportId,
      airportName: apiData.name,
      icaoCode: apiData?.icaoCode?.code,
      uwaCode: apiData.uwaCode,
      faaCode: apiData.faaCode,
      iataCode: apiData.iataCode,
      regionalCode: apiData.regionalCode,
      displayCode: apiData.displayCode
    };
    return new Airports(data);
  }

  static deserializeAirportReference(apiData: Airports): Airports {
    if (!apiData) {
      return new Airports();
    }
    const data: Partial<Airports> = {
      ...new Airports({
        airportId: apiData.airportId,
        airportName: apiData.airportName,
        icaoCode: apiData?.icaoCode,
        uwaCode: apiData.uwaCode,
        faaCode: apiData.faaCode,
        iataCode: apiData.iataCode,
        regionalCode: apiData.regionalCode,
        displayCode: apiData.displayCode
      }),
    };
    return new Airports(data);
  }

  static deserializeList(apiDataList: IAPIAirport[]): Airports[] {
    return apiDataList ? apiDataList.map((apiData: any) => Airports.deserialize(apiData)) : [];
  }

  public getDisplayCode() {
    return this.displayCode || this.icaoCode || this.uwaCode || this.faaCode || this.iataCode || this.regionalCode ;
  }

  // required in auto complete
  public get label(): string {
    return `${this?.airportName} (${this?.getDisplayCode()})`;
  }

  public get value(): string | number {
    return this.airportId;
  }
}
