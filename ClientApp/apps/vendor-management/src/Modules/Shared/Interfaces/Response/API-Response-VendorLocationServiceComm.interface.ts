import { IAPISettingBase } from '../IAPI-SettingBase.interface'
import { IAPIResponseVendorLocationContact } from './API-Response-VendorLocationContact'

export interface IAPIResponseVendorLocationServiceComm {
    createdBy: string
    modifiedBy: string
    createdOn: string
    modifiedOn: string
    id: number
    serviceComm: IAPISettingBase
    vendorLocationContact: IAPIResponseVendorLocationContact
    attention: string
    contactUsegeType: IAPISettingBase
    status: IAPISettingBase
    accessLevel: IAPISettingBase
  }