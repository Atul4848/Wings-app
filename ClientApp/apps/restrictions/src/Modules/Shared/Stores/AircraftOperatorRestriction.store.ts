import {
  baseApiPath,
  BaseCountryStore,
  HttpClient,
  NO_SQL_COLLECTIONS,
} from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IAPIAircraftOperatorRestrictions, IAPIAircraftOperatorRestrictionsRequest } from '../Interfaces';
import { AircraftOperatorRestrictionsModel } from '../Models';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities } from '@wings-shared/core';

export class AircraftOperatorRestrictionsStore extends BaseCountryStore {
  @observable public aircraftOperatorRestrictions: AircraftOperatorRestrictionsModel[] = [];

  /* istanbul ignore next */
  public getAircraftOperatorRestrictions(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<AircraftOperatorRestrictionsModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const sortCollection = [{ propertyName: 'AircraftOperatorRestrictionType.Name', isAscending: true }];
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRCRAFT_OPERATOR_RESTRICTION,
      sortCollection: JSON.stringify(sortCollection),
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIAircraftOperatorRestrictions>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: AircraftOperatorRestrictionsModel.deserializeList(response.results) })),
      tapWithAction(response => (this.aircraftOperatorRestrictions = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertAircraftOperatorRestrictions(
    requestModel?: IAPIAircraftOperatorRestrictionsRequest
  ): Observable<AircraftOperatorRestrictionsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.restrictions });
    const isNewRequest: boolean = requestModel?.id === 0;
    const upsertRequest: Observable<IAPIAircraftOperatorRestrictions> = isNewRequest
      ? http.post(apiUrls.aircraftOperatorRestriction, requestModel)
      : http.put(`${apiUrls.aircraftOperatorRestriction}/${requestModel.id}`, requestModel);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAircraftOperatorRestrictions) => AircraftOperatorRestrictionsModel.deserialize(response)),
      tap(() => AlertStore.info(`Aircraft Operator Restriction ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }
}
