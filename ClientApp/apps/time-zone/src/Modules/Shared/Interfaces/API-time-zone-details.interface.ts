export interface IAPITimeZoneDetails {
  isException: boolean;
  isCustomTimeZone: boolean;
  currentZoneName: string;
  currentZoneAbbreviation: string;
  currentGmtOffset: string;
  currentZoneStart: string;
  currentZoneEnd: string;
  nextZoneName: string;
  nextZoneAbbreviation: string;
  nextGmtOffset: string;
  nextZoneStart: string;
  nextZoneEnd: string;
  icao: string;
  iata: string;
  faaCode: string;
  city?: string;
  country?: string;
  countryId?: number;
  countryCode?: string;
  latitudeDegrees?: string;
  longitudeDegrees?: string;
  timeZoneIds: number[];
  locationId?: number;
}
