import { IBaseApiResponse } from '@wings-shared/core';
import { IApiAthorizationLevel } from './index';

export interface IAPIHealthVendor extends IBaseApiResponse {
    authorizationLevel?: IApiAthorizationLevel;
    vendorLevelEntityId: number;
    vendorLevelEntityCode: string;
    surveyLink: string;
    authorizationLevelId: number;
    healthVendorId?: number;
    healthVendorContacts: IAPIHealthVendorContact[]
}

export interface IAPIHealthVendorContact extends IBaseApiResponse {
    contactType?: IAPIContactType;
    contactLevel?: IAPIContactLevel;
    description: string,
    contact: string;
    contactTypeId: number;
    contactLevelId: number;
    healthVendorContactId?: number;
}

interface IAPIContactType extends IBaseApiResponse {
    contactTypeId: number;
}

interface IAPIContactLevel extends IBaseApiResponse {
    contactLevelId: number;
}
