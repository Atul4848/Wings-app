import { RegistryStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AssociatedRegistriesModel, CustomsDecalModel, ManageRegistriesModel, RegistryModel } from '../Models';
import { NO_SQL_COLLECTIONS } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';
import { IAPIManageRegistriesRequest } from '../Interfaces';

export class RegistryStoreMock extends RegistryStore {
  public getRegistriesNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<RegistryModel>> {
    return of({
      collectionName: NO_SQL_COLLECTIONS.REGISTRY,
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new RegistryModel(), new RegistryModel() ],
    });
  }

  public getRegistries(): Observable<RegistryModel[]> {
    return of([ new RegistryModel(), new RegistryModel() ]);
  }

  public upsertRegistry(registry: RegistryModel): Observable<RegistryModel> {
    return of(new RegistryModel());
  }

  public getRegistryById(registryId: number): Observable<RegistryModel> {
    return of(new RegistryModel());
  }

  public getAssociatedRegistries(
    customerNumber: string,
    request?: IAPIGridRequest
  ): Observable<AssociatedRegistriesModel[]> {
    return of([ new AssociatedRegistriesModel(), new AssociatedRegistriesModel() ]);
  }

  public upsertAssociatedRegistry(
    associatedRegistry: AssociatedRegistriesModel,
    partyId: number
  ): Observable<AssociatedRegistriesModel> {
    return of(new AssociatedRegistriesModel());
  }

  public manageRegistry(request: IAPIManageRegistriesRequest): Observable<ManageRegistriesModel> {
    return of(new ManageRegistriesModel());
  }

  public upsertCustomsDecal(request: CustomsDecalModel): Observable<CustomsDecalModel> {
    return of(new CustomsDecalModel());
  }
}
