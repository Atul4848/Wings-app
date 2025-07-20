import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportCustomsContact extends IBaseApiResponse {
  customsContactId: number;
  airportId: number;
  preferred: boolean;
  contactName: string;
  contactValue: string;
  contactNotes: string;
  customsContactType: IAPIContactType;
  customsContactAddressType: IAPIContactAddressType;
}

export interface IAPIContactType {
  id: number;
  customsContactTypeId?: number;
  name: string;
}

export interface IAPIContactAddressType {
  id: number;
  customsContactAddressTypeId?: number;
  name?: string;
}

//REQUEST
export interface IAPIAirportCustomsContactRequest extends IBaseApiResponse {
  airportId: number;
  customsContactId?: number;
  preferred: boolean;
  contactName: string;
  contactValue: string;
  contactNotes: string;
  customsContactTypeId: number;
  customsContactAddressTypeId: number;
}
