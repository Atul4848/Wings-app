import { IAPIResponseMasterContact } from './API-Response-MasterContact'
import { IAPIResponseVendorLocation } from './API-Response-VendorLocation'

export interface IAPIResponseVendorLocationContact {
    vendorLocationContactId: number
    vendorLocation: IAPIResponseVendorLocation
    contact: IAPIResponseMasterContact
  }