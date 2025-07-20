import {
  BaseCountryStore,
  HttpClient,
  baseApiPath,
  CabotageModel,
  IAPICabotage,
  IAPIFlightPlanning,
  FlightPlanningModel,
  GeneralModel,
  IAPIGeneral,
} from '@wings/shared';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, IBaseApiResponse, Utilities } from '@wings-shared/core';
import { CabotageReviewModel } from '../Models';
import { IAPICabotageReview } from '../Interfaces';

export class OperationalRequirementStore extends BaseCountryStore {
  /* istanbul ignore next */
  public getCabotage(request?: IAPICabotage): Observable<CabotageModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    return http.get<IAPICabotage>(`${apiUrls.referenceData}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CabotageModel.deserialize(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getGeneral(request?: IAPIGeneral): Observable<GeneralModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    return http.get<IAPICabotage>(`${apiUrls.referenceData}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: GeneralModel.deserialize(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getFlightPlanning(request?: IAPIFlightPlanning): Observable<FlightPlanningModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    return http.get<IAPIFlightPlanning>(`${apiUrls.referenceData}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: FlightPlanningModel.deserialize(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertRequirement<T extends IBaseApiResponse>(
    request: T,
    requirementType: string,
    path: string
  ): Observable<T> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const _apiPath = `${apiUrls.country}/${(request as any).countryId}/${path}`;
    const isNewRequest: boolean = (request as any).id === 0;
    const upsertRequest: Observable<T> = isNewRequest
      ? http.post<T>(_apiPath, request)
      : http.put<T>(`${_apiPath}/${request.id}`, request);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => response),
      tap(() => AlertStore.info(`${requirementType} ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  public getCabotageReview(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<CabotageReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return http
      .get<IAPIPageResponse<IAPICabotageReview>>(`${apiUrls.cabotageOperationalRequirementStaging}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: CabotageReviewModel.deserializeList(response.results) }))
      );
  }

  public getCabotageReviewList(rowIndex?: number): Observable<CabotageReviewModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http
      .get<IAPIPageResponse<IAPICabotageReview>>(
        `${apiUrls.cabotageOperationalRequirementStaging}/CabotageOperationalRequirementStagingPropertyList/${rowIndex}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => CabotageReviewModel.deserialize(response))
      );
  }

  /* istanbul ignore next */
  public approveCabotageStaging(request): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    console.log(request,'request')
    return http
      .put<string[]>(
        `${apiUrls.cabotageOperationalRequirementStaging}/Approve/${request.cabotageOperationalRequirementStagingId}`,
        request
      )
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
  public rejectCabotageStaging(request): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    return http
      .put<string[]>(
        `${apiUrls.cabotageOperationalRequirementStaging}/Reject/${request.cabotageOperationalRequirementStagingId}`,
        request
      )
      .pipe(
        Logger.observableCatchError,
        tap(resp => {
          resp.hasErrors
            ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
            : AlertStore.info('Records Rejected successfully!');
        })
      );
  }
}
