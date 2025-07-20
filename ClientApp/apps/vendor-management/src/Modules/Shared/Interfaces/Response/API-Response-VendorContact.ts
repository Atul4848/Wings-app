import { IAPISettingBase } from '../API-SettingBase'
import { IAPIVMSVendorComparison, IAPIVmsBaseTable } from '../API-vms-import-comparison.interface'

export interface IAPIResponseVendorContact {
    id: number
    vendor: IAPIVmsBaseTable
    contact: IAPIVMSVendorComparison
    contactUsegeType: IAPISettingBase
    status: IAPISettingBase
    accessLevel: IAPISettingBase
  }
