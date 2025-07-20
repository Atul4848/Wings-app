import { action, observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';
import { BulletinModel, UAOfficesModel } from '../Models';
import { SettingsBaseStore, apiUrls, gqlItems } from '../../../Stores';
import { IAPIBulletin } from '../Interfaces';
import { NO_SQL_COLLECTIONS } from '../../../Enums';
import { baseApiPath } from '../../../API';
import { getGqlQuery, HttpClient } from '../../../Tools';
import { IAPIBulletinReview } from '../../../Interfaces';
import { BulletinReviewModel } from '../../../Models';

export class BulletinStore extends SettingsBaseStore {
  @observable uaOffices: UAOfficesModel[] = [];

  constructor(baseUrl) {
    super(baseUrl);
  }

  @action
  public getBulletins(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<BulletinModel>> {
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return this.http.get<IAPIPageResponse<IAPIBulletin>>(`${apiUrls.bulletin}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: BulletinModel.deserializeList(response.results) }))
    );
  }

  @action
  public getBulletinsNoSql(
    pageRequest: IAPIGridRequest,
    collectionName: NO_SQL_COLLECTIONS
  ): Observable<IAPIPageResponse<BulletinModel>> {
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName,
      sortCollection: JSON.stringify([{ propertyName: 'BulletinLevel.Name', isAscending: true }]),
      ...pageRequest,
    });

    if (collectionName === NO_SQL_COLLECTIONS.COUNTRY_BULLETIN) {
      const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
      return from(
        http.post<any>('/graphql', { query: getGqlQuery(params, gqlItems.bulletin) })
      ).pipe(
        map(resp => {
          const collection = resp.data['countryBulletin'];
          return {
            pageNumber: pageRequest.pageNumber,
            pageSize: pageRequest.pageSize,
            totalNumberOfRecords: collection?.totalCount,
            results: BulletinModel.deserializeList(collection?.items) || [],
          };
        })
      );
    }

    return new HttpClient({ baseURL: baseApiPath.noSqlData })
      .get<IAPIPageResponse<IAPIBulletin>>(`${apiUrls.referenceData}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: BulletinModel.deserializeList(response.results) }))
      );
  }

  public getPurgedBulletins(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<BulletinModel>> {
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return this.http.get<IAPIPageResponse<IAPIBulletin>>(`${apiUrls.purgedBulletin}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: BulletinModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  @action
  public getBulletinById(bulletinId: number, purgedBulletin: boolean): Observable<BulletinModel> {
    const _url = purgedBulletin ? apiUrls.purgedBulletin : apiUrls.bulletin;
    return this.http.get<IAPIBulletin>(`${_url}/${bulletinId}`).pipe(
      Logger.observableCatchError,
      map(response => BulletinModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public upsertBulletin(request: IAPIBulletin): Observable<BulletinModel> {
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIBulletin> = isNewRequest
      ? this.http.post<IAPIBulletin>(apiUrls.bulletin, request)
      : this.http.put<IAPIBulletin>(`${apiUrls.bulletin}/${request.id}`, request);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => BulletinModel.deserialize(response)),
      tap(() => AlertStore.info(`Bulletin ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public activateBulletin(bulletinId: number): Observable<string> {
    const upsertRequest: Observable<number> = this.http.put<number>(
      `${apiUrls.purgedBulletin}/${bulletinId}/reactivate`,
      {
        id: bulletinId,
      }
    );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Bulletin activated successfully!'))
    );
  }

  /* istanbul ignore next */
  public loadUAOffices(forceRefresh?: boolean): Observable<UAOfficesModel[]> {
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.UA_OFFICE,
      sortCollection: JSON.stringify([{ propertyName: 'uaOfficeId', isAscending: false }]),
    });
    return this.getResult(
      `${apiUrls.referenceData}?${params}`,
      this.uaOffices,
      forceRefresh,
      UAOfficesModel.deserializeList,
      {
        baseUrl: baseApiPath.noSqlData,
      }
    ).pipe(tapWithAction(uaOffices => (this.uaOffices = uaOffices)));
  }

  public getBulletinReviews(
    isAirport: boolean,
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<BulletinReviewModel>> {
    const _baseURL = isAirport ? baseApiPath.airports : baseApiPath.countries;
    const http: HttpClient = new HttpClient({ baseURL: _baseURL });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIBulletinReview>>(`${apiUrls.bulletinStaging}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: BulletinReviewModel.deserializeList(response.results) }))
    );
  }

  public getBulletinStagingProperties(id: number, isAirport: boolean): Observable<BulletinReviewModel> {
    const _baseURL = isAirport ? baseApiPath.airports : baseApiPath.countries;
    const http: HttpClient = new HttpClient({ baseURL: _baseURL });
    return http
      .get<IAPIPageResponse<IAPIBulletinReview>>(`${apiUrls.bulletinStaging}/UplinkBulletinPropertyList/${id}`)
      .pipe(
        Logger.observableCatchError,
        map(response => BulletinReviewModel.deserialize(response))
      );
  }

  /* istanbul ignore next */
  public approveBulletinStaging(stagingId: Number, isAirport: boolean): Observable<any> {
    const _baseURL = isAirport ? baseApiPath.airports : baseApiPath.countries;
    const http: HttpClient = new HttpClient({ baseURL: _baseURL });
    return http
      .put<string[]>(`${apiUrls.bulletinStaging}/Approve/${stagingId}`, { uplinkStagingId: stagingId })
      .pipe(
        Logger.observableCatchError,
        tap(resp => {
          resp.hasErrors
            ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
            : AlertStore.info('Records Approved successfully!');
        })
      );
  }

  /* istanbul ignore next */
  public rejectBulletinStaging(stagingId: Number, isAirport: boolean): Observable<any> {
    const _baseURL = isAirport ? baseApiPath.airports : baseApiPath.countries;
    const http: HttpClient = new HttpClient({ baseURL: _baseURL });
    return http
      .put<string[]>(`${apiUrls.bulletinStaging}/Reject/${stagingId}`, { uplinkStagingId: stagingId })
      .pipe(
        Logger.observableCatchError,
        tap(resp => {
          resp.hasErrors
            ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
            : AlertStore.info('Records Rejected successfully!');
        })
      );
  }

  /* istanbul ignore next */
  public updateCappsCategory(request, isAirport): Observable<any> {
    const _baseURL = isAirport ? baseApiPath.airports : baseApiPath.countries;
    const http: HttpClient = new HttpClient({ baseURL: _baseURL });
    return http.put<string[]>(`${apiUrls.bulletinStaging}/${request.bulletinStagingPropertyId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('CAPPS Category Code updated successfully!');
      })
    );
  }
}
