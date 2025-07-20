import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Logger } from '@wings-shared/security';
import { HttpClient, NO_SQL_COLLECTIONS, SettingsBaseStore, baseApiPath } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';
import { AssociatedRegistriesModel, CustomsDecalModel, ManageRegistriesModel, RegistryModel } from '../Models';
import { IAPIAssociatedRegistries, IAPICustomsDecal, IAPIManageRegistriesRequest, IAPIRegistry } from '../Interfaces';
import { apiUrls } from './API.url';

export class RegistryStore extends SettingsBaseStore {
  @observable public registries: RegistryModel[] = [];
  @observable public registryList: RegistryModel[] = [];
  @observable public associatedRegistries: AssociatedRegistriesModel[] = [];
  @observable public selectedRegistry: RegistryModel = new RegistryModel();
  @observable public selectedAssociatedRegistry: AssociatedRegistriesModel = new AssociatedRegistriesModel();
  @observable public customsDecal: CustomsDecalModel[] = [];

  constructor(baseUrl?: string) {
    super(baseUrl || '');
  }

  /* istanbul ignore next */
  public getRegistriesNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<RegistryModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.REGISTRY,
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIRegistry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: RegistryModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getRegistries(): Observable<RegistryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
    });
    return http.get<IAPIPageResponse<IAPIRegistry>>(`${apiUrls.registry}?${params}`).pipe(
      Logger.observableCatchError,
      map(response =>
        Utilities.customArraySort<RegistryModel>(RegistryModel.deserializeList(response.results), 'name')
      ),
      tap(response => (this.registryList = response))
    );
  }

  /* istanbul ignore next */
  public upsertRegistry(registry: RegistryModel): Observable<RegistryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddRegistry: boolean = registry.id === null;
    const upsertRequest: Observable<IAPIRegistry> = isAddRegistry
      ? http.post<IAPIRegistry>(apiUrls.registry, registry.serialize())
      : http.put<IAPIRegistry>(`${apiUrls.registry}/${registry.id}`, registry.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIRegistry) => RegistryModel.deserialize(response)),
      tapWithAction((registry: RegistryModel) => {
        this.registries = Utilities.updateArray<RegistryModel>(this.registries, registry, {
          replace: !isAddRegistry,
          predicate: t => t.id === registry.id,
        });
        return AlertStore.info(`Registry ${isAddRegistry ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public manageRegistry(request: IAPIManageRegistriesRequest): Observable<ManageRegistriesModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http.put<IAPIManageRegistriesRequest>(apiUrls.manageRegistries(request.customerNumber), request).pipe(
      Logger.observableCatchError,
      tap(registry => AlertStore.info('Registry updated successfully!'))
    );
  }

  /* istanbul ignore next */
  public getRegistryById(registryId: number): Observable<RegistryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http
      .get<IAPIRegistry>(`${apiUrls.registry}/${registryId}`)
      .pipe(map(response => RegistryModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public getAssociatedRegistryById(customerNumber: string, registryId: number): Observable<AssociatedRegistriesModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http
      .get<IAPIAssociatedRegistries>(`${customerNumber}/${apiUrls.associatedRegistry}/${registryId}`)
      .pipe(map(response => AssociatedRegistriesModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public getAssociatedRegistries(
    customerNumber: string,
    request?: IAPIGridRequest
  ): Observable<AssociatedRegistriesModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      customerNumber,
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIAssociatedRegistries>>(`${customerNumber}/${apiUrls.associatedRegistry}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => AssociatedRegistriesModel.deserializeList(response.results)),
        tapWithAction(resp => (this.associatedRegistries = resp))
      );
  }

  /* istanbul ignore next */
  public upsertAssociatedRegistry(
    associatedRegistry: AssociatedRegistriesModel,
    partyId: number
  ): Observable<AssociatedRegistriesModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddAssociatedRegistry: boolean = associatedRegistry.id === null;
    const upsertRequest: Observable<IAPIAssociatedRegistries> = isAddAssociatedRegistry
      ? http.post<IAPIAssociatedRegistries>(
        `${associatedRegistry.customer.number}/${apiUrls.associatedRegistry}`,
        associatedRegistry.serialize(partyId)
      )
      : http.put<IAPIAssociatedRegistries>(
        `${associatedRegistry.customer.number}/${apiUrls.associatedRegistry}`,
        associatedRegistry.serialize(partyId)
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAssociatedRegistries) => AssociatedRegistriesModel.deserialize(response)),
      tapWithAction((associatedRegistry: AssociatedRegistriesModel) => {
        this.associatedRegistries = Utilities.updateArray<AssociatedRegistriesModel>(
          this.associatedRegistries,
          associatedRegistry,
          {
            replace: !isAddAssociatedRegistry,
            predicate: t => t.id === associatedRegistry.id,
          }
        );
        return AlertStore.info(`Associated Registry ${isAddAssociatedRegistry ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getCustomsDecal(request?: IAPIGridRequest): Observable<CustomsDecalModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICustomsDecal>>(`${apiUrls.customsDecal}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => CustomsDecalModel.deserializeList(response.results))
    );
  }

  /* istanbul ignore next */
  public upsertCustomsDecal(request: CustomsDecalModel): Observable<CustomsDecalModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddCustomsDecal: boolean = request.id === 0;
    const upsertRequest: Observable<IAPICustomsDecal> = isAddCustomsDecal
      ? http.post<IAPICustomsDecal>(`${apiUrls.customsDecal}`, request.serialize())
      : http.put<IAPICustomsDecal>(`${apiUrls.customsDecal}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPICustomsDecal) => CustomsDecalModel.deserialize(response)),
      tapWithAction((customsDecal: CustomsDecalModel) => {
        this.customsDecal = Utilities.updateArray<CustomsDecalModel>(this.customsDecal, customsDecal, {
          replace: !isAddCustomsDecal,
          predicate: t => t.id === customsDecal.id,
        });
        return AlertStore.info(`Customs Decal ${isAddCustomsDecal ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public removeCustomsDecal(id: number): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http.delete<string>(`${apiUrls.customsDecal}/${id}`).pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Customs decal deleted successfully!'))
    );
  }
}
