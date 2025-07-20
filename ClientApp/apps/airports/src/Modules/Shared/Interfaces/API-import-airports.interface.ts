import { IAPIATSAirport } from './API-ATS-airport.interface';

export interface IAPIImportAirports {
  exceptionAirports: IAPIATSAirport[];
  hasAllSuccess: boolean;
}
