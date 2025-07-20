export interface IAPIManageRegistriesRequest {
  partyId: number;
  customerNumber: string;
  customerAssociatedRegistryIds: number[];
  associatedOfficeId: number;
  teamId: number;
  includeAllRegistry: boolean;
}
