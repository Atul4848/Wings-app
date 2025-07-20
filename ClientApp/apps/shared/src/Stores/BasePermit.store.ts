import { Observable } from 'rxjs';
import { BaseStore } from './Base.store';
import { HttpClient } from '../Tools';
import { observable } from 'mobx';
import { permitURLs } from './ApiUrls';
import { baseApiPath } from '../API';
import { EntityMapModel, IAPIGridRequest, Utilities } from '@wings-shared/core';

import { map } from 'rxjs/operators';
import { Logger } from '@wings-shared/security';
export class BasePermitStore extends BaseStore {
  @observable public purposeOfFlight: EntityMapModel[] = [];
  @observable public flightOperationalCategories: EntityMapModel[] = [];
  @observable public permitDocuments: EntityMapModel[] = [];

  /* istanbul ignore next */
  public getRvsmComplianceExceptions(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.permits,
    });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get(`/${permitURLs.purposeOfFlight}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.purposeOfFlight = response.results?.map(
          x =>
            new EntityMapModel({
              ...x,
              id: 0,
              entityId: x.id,
              name: x.name,
              code: x.code,
            })
        );
        return this.purposeOfFlight;
      })
    );
  }

  /* istanbul ignore next */
  public getFlightOperationalCategories(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.permits,
    });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get(`/${permitURLs.flightOperationalCategory}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.flightOperationalCategories = response.results?.map(
          x =>
            new EntityMapModel({
              ...x,
              id: 0,
              entityId: x.id,
              name: x.name,
              code: x.code,
            })
        );
        return this.flightOperationalCategories;
      })
    );
  }

  /* istanbul ignore next */
  public getPermitDocuments(pageRequest?: IAPIGridRequest): Observable<EntityMapModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    const params: string = Utilities.buildParamString({ pageSize: 0 });
    return http.get(`/${permitURLs.document}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.permitDocuments = response.results?.map(
          x =>
            new EntityMapModel({
              ...x,
              id: 0,
              entityId: x.id,
              name: x.name,
              code: x.code,
            })
        );
        return this.permitDocuments;
      })
    );
  }
}
