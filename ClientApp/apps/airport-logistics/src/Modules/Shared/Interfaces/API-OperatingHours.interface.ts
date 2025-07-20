export interface IAPIOperatingHours extends IAPIOperatingHoursRequest {
  SubComponentId: string;
}

export interface IAPIOperatingHoursRequest {
  AirportFacilityTimingId: number;
  Day: string;
  FromTime: string;
  ToTime: string;
}
