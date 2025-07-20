import { IAPISettingBase } from '../API-SettingBase'
import { IAPIVmsBaseTable } from '../API-vms-import-comparison.interface'
import { IAPIResponseVendorLocationDocument } from './API-Response-VendorLocation'

export interface IAPIResponseDocumentUpload {
    id: number
    documentName: IAPISettingBase
    documentUri: string
    vendor: IAPIVmsBaseTable
    vendorLocation: IAPIResponseVendorLocationDocument
    status: IAPISettingBase
    otherName: string
    startDate: string
    endDate?: string
    comment?: string
    lastUpdated: string
  }
