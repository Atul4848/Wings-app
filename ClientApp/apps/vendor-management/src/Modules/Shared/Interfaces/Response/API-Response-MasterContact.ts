import { IAPISettingBase } from '../IAPI-SettingBase.interface'

export interface IAPIResponseMasterContact {
    id: number
    contactMethod: IAPISettingBase
    contact: string
    contactType: IAPISettingBase
    contactName: string
    title: string
  }