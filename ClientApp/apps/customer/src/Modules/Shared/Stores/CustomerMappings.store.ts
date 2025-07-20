import { AlertStore } from '@uvgo-shared/alert';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { Logger } from '@wings-shared/security';
import { baseApiPath, BaseStore, HttpClient, NO_SQL_COLLECTIONS } from '@wings/shared';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IAPIExternalCustomerMapping } from '../Interfaces';
import { ExternalCustomerMappingModel } from '../Models';
import { apiUrls } from './API.url';

export class CustomerMappingsStore extends BaseStore {
  /* istanbul ignore next */
  public getExternalCustomerMappings(
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<ExternalCustomerMappingModel>> {
    const http = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.EXTERNAL_CUSTOMER_MAPPING,
      sortCollection: JSON.stringify([{ propertyName: 'Status.Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIExternalCustomerMapping>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: ExternalCustomerMappingModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertExternalCustomerMapping(mapping: IAPIExternalCustomerMapping): Observable<ExternalCustomerMappingModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isNewRequest: boolean = mapping.id === 0;
    const upsertRequest: Observable<IAPIExternalCustomerMapping> = isNewRequest
      ? http.post(apiUrls.externalCustomerMapping, mapping)
      : http.put(`${apiUrls.externalCustomerMapping}/${mapping.id}`, mapping);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => ExternalCustomerMappingModel.deserialize(response)),
      tap(() => AlertStore.info(`External Customer Mapping ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }
}
