import { IAPISettingBase } from '../API-SettingBase'

export interface IAPIResponseVendorAddress {
    id: number
    vendorId: number
    vendorAddressId: number
    addressTypeId: number
    zipCode: string
    addressType: IAPISettingBase
    countryReference: IAPIResponseCountry
    stateReference: IAPIResponseState
    cityReference: IAPIResponseCity
    addressLine1: string
    addressLine2: string
}

export interface IAPIResponseCountry{
    id:number
    countryId:number
    name:string
    code:string
}
export interface IAPIResponseState{
    id:number
    stateId:number
    name:string
    code:string
}

export interface IAPIResponseCity{
    id:number
    cityId:number
    name:string
    code:string
}