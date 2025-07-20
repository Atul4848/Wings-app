import { IAPIAirport } from '../API-airport.interface'

export interface IAPIRequestVendorLocationContact {
    ids:number[],
    userId: string,
    vendorLocationIds: number[],
    contactId: number,
    contactUsegeTypeId: number,
    statusId: number,
    accessLevelId: number,
    vendorId: number,
    vendorOnBoardInvitationRequest: IAPIRequestOnboardInvitation,
  }
  
export interface IAPIRequestOnboardInvitation {
    userId: string,
    id: number,
    airportReferenceRequest: IAPIAirport,
    isInviteEmailSent: boolean,
    comment: string
  }