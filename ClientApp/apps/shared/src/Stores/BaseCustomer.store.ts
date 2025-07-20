import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseStore } from './Base.store';
import { HttpClient } from '../Tools';
import { IAPIRegistry } from '../Interfaces';
import { observable } from 'mobx';
import { NO_SQL_COLLECTIONS } from '../Enums';
import { apiUrls } from './ApiUrls';
import { baseApiPath } from '../API';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, SettingsTypeModel } from '@wings-shared/core';

export class BaseCustomerStore extends BaseStore {
  @observable public registries: SettingsTypeModel[] = [];

  /* istanbul ignore next */
  public getRegistriesNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<SettingsTypeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.REGISTRY,
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });

    return http.get<IAPIPageResponse<IAPIRegistry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return {
          ...response,
          results: response.results?.map(
            x =>
              new SettingsTypeModel({
                name: x.name,
                id: x.registryId,
                status: x.status,
              })
          ),
        };
      })
    );
  }
}
