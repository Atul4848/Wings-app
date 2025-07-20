import { Observable, of } from 'rxjs';
import { IAPIFederationMappingRequest } from '../Interfaces';
import { FederationMappingModel } from '../Models';
import { FederationMappingStore } from '../Stores';

export class FederationMappingStoreMock extends FederationMappingStore {
  public loadFederation(): Observable<FederationMappingModel[]> {
    return of([ new FederationMappingModel(), new FederationMappingModel() ])
  }

  public upsertIdpMapping(upsertIdpMappingRequest: IAPIFederationMappingRequest): Observable<FederationMappingModel> {
    return of(new FederationMappingModel());
  }

  public deleteFederation(identityProvider: string): Observable<boolean> {
    return of(true);
  }
}