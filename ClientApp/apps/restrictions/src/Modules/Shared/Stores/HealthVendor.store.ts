import { baseApiPath, HttpClient, NO_SQL_COLLECTIONS, SettingsBaseStore } from '@wings/shared';
import { action, observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IAPIHealthVendor } from '../Interfaces';
import { HealthVendorModel } from '../Models';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities, SettingsTypeModel } from '@wings-shared/core';

export class HealthVendorStore extends SettingsBaseStore {
  @observable public healthVendors: HealthVendorModel[] = [];
  @observable public contactLevels: SettingsTypeModel[] = [];
  @observable public healthVendor : HealthVendorModel = new HealthVendorModel()

  constructor() {
    super(baseApiPath.restrictions);
  }

  /* istanbul ignore next */
  public getHealthVendors(
    forceRefresh?: boolean
  ): Observable<IAPIPageResponse<HealthVendorModel>> {
    const specifiedFields = [
      'AuthorizationLevel',
      'Name',
      'HealthVendorId',
      'RequestedBy',
      'RequestedDate',
      'Status',
    ];
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const sortCollection = [{ propertyName: 'AuthorizationLevel.Name', isAscending: true }]
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.HEALTH_VENDOR,
      sortCollection: JSON.stringify(sortCollection),
    });

    if (this.healthVendors?.length && !forceRefresh) {
      return of({ results: this.healthVendors, pageNumber: 1, pageSize: 10, totalNumberOfRecords: 10 });
    }
    return http.get<IAPIPageResponse<IAPIHealthVendor>>(`${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: HealthVendorModel.deserializeList(response.results) })),
      tapWithAction(response => (this.healthVendors = response.results))
    );
  }

  /* istanbul ignore next */
  public getHealthVendorById(
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<HealthVendorModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.HEALTH_VENDOR,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIHealthVendor>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: HealthVendorModel.deserializeList(response.results) })),
    );
  }

  /* istanbul ignore next */
  @action
  public upsertHealthVendor(request: HealthVendorModel): Observable<HealthVendorModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIHealthVendor> = isNewRequest
      ? http.post<IAPIHealthVendor>(apiUrls.healthVendor, request.serialize())
      : http.put<IAPIHealthVendor>(`${apiUrls.healthVendor}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIHealthVendor) => HealthVendorModel.deserialize(response)),
      tap(() => AlertStore.info(`Health Vendor ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getContactLevels(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.contactLevel,
      this.contactLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(contactLevels => (this.contactLevels = contactLevels)));
  }

  /* istanbul ignore next */
  public upsertContactLevels(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.contactLevel, 'Contact Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((contactLevel: SettingsTypeModel) => {
        this.contactLevels = Utilities.updateArray<SettingsTypeModel>(this.contactLevels, contactLevel, {
          replace: !isAddRequest,
          predicate: t => t.id === contactLevel.id,
        });
      })
    );
  }
}
