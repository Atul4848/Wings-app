import { IAPISettingBase } from '../API-SettingBase'
import { IAPIAirport } from '../API-airport.interface'

export interface IAPIResponseVendorLocation {
    id: number
    name: string
    code: string
  }

export interface IAPIResponseVendorLocationDocument {
  vendorLocationId: number
  name: string
  code: string
  airportReference: IAPIAirport 
}

export interface IAPIResponseVendorLocationHours {
  id: number;
  sequence: number;
  hoursType: IAPISettingBase;
  hoursScheduleType: IAPISettingBase;
  status: IAPISettingBase;
  accessLevel: IAPISettingBase;
  scheduleResponse: IAPIScheduleResponse;
  schedule: IAPIScheduleResponse;
}

export interface IAPIScheduleResponse {
  id: number;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  is24Hours: boolean;
  includeHoliday: boolean;
  patternedRecurrence: IAPIPatternedRecurrence;
}

export interface IAPIPatternedRecurrence {
  id: number;
  scheduleId: number;
  patternedRecurrenceType: IAPISettingBase;
  patternedRecurrenceDaysofWeek: IAPIDaysOfWeekResponse[]
}

export interface IAPIDaysOfWeekResponse {
  id: number;
  patternedRecurrenceId: number;
  dayOfWeek?: IAPISettingBase;
}


export interface IAPIA2GFile {
  document: File;
  vendorLocationId: number;
}

export interface IAPIResponseGroundServiceProvider {
  id: number;
  vendorLocation: IAPIResponseVendorLocation;
  appliedVendorLocation: IAPIResponseVendorLocation;
  otherName: string;
  status: IAPISettingBase;
  groundServiceProviderOperationType: IAPIResponseGroundServiceProviderOperationType[];
}

export interface IAPIResponseGroundServiceProviderOperationType {
  id: number;
  groundServiceProviderId: number;
  operationType: IAPISettingBase;
}

export interface IAPIResponseServiceItemPricingApproval {
  oldValue: string;
  newValue: string;
}