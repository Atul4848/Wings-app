import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIRegistryAssociationDetail extends IBaseApiResponse {
  customersWithNonStandardRunwayAnalysisRegistryOptionId?: number;
  customersWithNonStandardRunwayAnalysisRegistryId?: number;
  deliveryPackageType?: DeliveryPackageType;
  departure?: Departure;
  destination?: Destination;
  destinationAlternate?: DestinationAlternate;
  takeoffAlternate?: TakeoffAlternate;
  reclearDestination?: ReclearDestination;
  etp?: Etp;
  etops?: Etops;
  pointOfSafeReturn?: PointOfSafeReturn;
  reclearAlternate?: ReclearAlternate;
}

interface DeliveryPackageType extends IBaseApiResponse{
  deliveryPackageTypeId: number
}
interface Departure extends IBaseApiResponse{
  departureId: number
}
interface Destination extends IBaseApiResponse{
  destinationId: number
}
interface DestinationAlternate extends IBaseApiResponse{
  destinationAlternateId: number
}
interface TakeoffAlternate extends IBaseApiResponse{
  takeoffAlternateId: number
}
interface ReclearDestination extends IBaseApiResponse{
  reclearDestinationId: number
}
interface Etp extends IBaseApiResponse{
  etpId: number
}
interface Etops extends IBaseApiResponse{
  etopsId: number
}
interface PointOfSafeReturn extends IBaseApiResponse{
  pointOfSafeReturnId: number
}
interface ReclearAlternate extends IBaseApiResponse{
  reclearAlternateId: number
}




export interface IAPIRequest {
  id: number,
  customersWithNonStandardRunwayAnalysisRegistryId: number,
  deliveryPackageTypeId: number,
  departureId: number,
  destinationId: number,
  destinationAlternateId: number,
  takeoffAlternateId: number,
  reclearDestinationId: number,
  reclearAlternateId: number,
  etpId: number,
  etopsId: number,
  pointOfSafeReturnId: number

}

