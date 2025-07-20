import { HttpClient, BaseStore, baseApiPath, NO_SQL_COLLECTIONS, getGqlQuery, gqlItems } from '@wings/shared';
import { apiUrls } from './API.url';
import { FIRModel } from '../Models';
import { observable } from 'mobx';
import { IAPIFIR } from '../Interfaces';
import { finalize, map, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { camelCase } from 'camel-case';

export class FIRStore extends BaseStore {
  @observable public firsOverLandmass: FIRModel[] = [];

  /* istanbul ignore next */
  public getFIRsOwned(request?: IAPIGridRequest): Observable<IAPIPageResponse<FIRModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.FIR,
      ...request,
    });
    return from(
      http.post<any>('/graphql', { query: getGqlQuery(params, gqlItems.fir) })
    ).pipe(
      map(resp => {
        const collection = resp.data[camelCase('fir')];
        return {
          pageNumber: request.pageNumber,
          pageSize: request.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: FIRModel.deserializeList(collection?.items) || [],
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertFIRControllingCountry(fir: FIRModel): Observable<FIRModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const isAddAssociatedRegion: boolean = fir.id === 0;
    const upsertRequest: Observable<IAPIFIR> = isAddAssociatedRegion
      ? http.post<IAPIFIR>(apiUrls.fir, fir.serialize())
      : http.put<IAPIFIR>(`${apiUrls.fir}/${fir.id}`, fir.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIFIR) => FIRModel.deserialize(response)),
      tap(() =>
        AlertStore.info(`FIR Controlling Country ${isAddAssociatedRegion ? 'created' : 'updated'} successfully!`)
      ),
      finalize(() => this.loader.hideLoader())
    );
  }
}
