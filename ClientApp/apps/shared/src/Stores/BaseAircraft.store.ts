import { Observable } from 'rxjs';
import { BaseStore } from './Base.store';
import { HttpClient } from '../Tools';
import { observable } from 'mobx';
import { aircraftURLs, apiUrls } from './ApiUrls';
import { baseApiPath } from '../API';
import { EntityMapModel, IAPIGridRequest, tapWithAction, Utilities } from '@wings-shared/core';

import { map, takeUntil } from 'rxjs/operators';
import { Logger } from '@wings-shared/security';
import { AirframeModel } from '../Models';
import { NO_SQL_COLLECTIONS } from '../Enums';
import { IAPIAirframe } from '../Interfaces';
export class BaseAircraftStore extends BaseStore {
  @observable public bannedAircraft: EntityMapModel[] = [];
  @observable public noiseChapters: EntityMapModel[] = [];
  @observable public airframe: AirframeModel;

  /* istanbul ignore next */
  public getBannedAircraft(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.aircraft,
    });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get(`/${aircraftURLs.ICAOTypeDesignator}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.bannedAircraft = response.results?.map(
          x =>
            new EntityMapModel({
              ...x,
              id: 0,
              entityId: x.id,
              name: x.name,
              code: x.code,
            })
        );
        return this.bannedAircraft;
      })
    );
  }

  /* istanbul ignore next */
  public getNoiseRestrictedAircraft(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.aircraft,
    });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get(`/${aircraftURLs.noiseChapter}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.noiseChapters = response.results?.map(
          x =>
            new EntityMapModel({
              ...x,
              id: 0,
              entityId: x.id,
              name: x.name,
              code: x.code,
            })
        );
        return this.noiseChapters;
      })
    );
  }

  /* istanbul ignore next */
  public getAirframeNoSQL(request?: IAPIGridRequest): Observable<AirframeModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRFRAME,
      sortCollection: JSON.stringify([{ propertyName: 'SerialNumber', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIAirframe>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => AirframeModel.deserialize(response.results[0])),
      tapWithAction(airframe => (this.airframe = airframe))
    );
  }
}
