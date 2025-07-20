export interface IAPIResponseBankInformation {
    id: number
    name: string
    addressLine1: string
    addressLine2: string
    countryReference: IAPIResponseCountry
    stateReference: IAPIResponseState
    cityReference: IAPIResponseCity
    zipCode: string
    vendorId: number
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
  