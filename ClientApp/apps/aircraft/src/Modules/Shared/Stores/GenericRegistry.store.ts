import {
  baseApiPath,
  NO_SQL_COLLECTIONS,
  HttpClient,
} from '@wings/shared';
import { observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GenericRegistryModel } from '../Models';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIGenericRegistry } from '../Interfaces';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';

export class GenericRegistryStore {
  @observable public genericRegistries: GenericRegistryModel[] = [];

  /* istanbul ignore next */
  public getGenericRegistries(forceRefresh?: boolean): Observable<IAPIPageResponse<GenericRegistryModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.NAV_BLUE_GENERIC_REGISTRY,
    });

    if (this.genericRegistries?.length && !forceRefresh) {
      return of({
        results: this.genericRegistries,
        pageNumber: 1,
        pageSize: 30,
        totalNumberOfRecords: this.genericRegistries.length,
      });
    }
    return http.get<IAPIPageResponse<IAPIGenericRegistry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: GenericRegistryModel.deserializeList(response.results) })),
      tapWithAction(response => (this.genericRegistries = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertGenericRegistry(request: GenericRegistryModel): Observable<GenericRegistryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIGenericRegistry> = isNewRequest
      ? http.post<any>(apiUrls.genericRegistry, request.serialize())
      : http.put<any>(`${apiUrls.genericRegistry}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIGenericRegistry) => GenericRegistryModel.deserialize(response)),
      tap(() => AlertStore.info(`Generic registry ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getGenericRegistryById(request: IAPIGridRequest): Observable<GenericRegistryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.NAV_BLUE_GENERIC_REGISTRY,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIGenericRegistry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => GenericRegistryModel.deserialize(response.results[0]))
    );
  }

  /* istanbul ignore next */
  public refreshGenericRegistry(model: GenericRegistryModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const request = http.put(apiUrls.refreshNavBlue(model.id), model);
    return request.pipe(
      map((response: any) => response.isSuccess),
      tap(() => AlertStore.info('Generic registry refreshed successfully!'))
    );
  }
}
