import { observable } from 'mobx';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Logger } from '@wings-shared/security';
import { HttpClient, NO_SQL_COLLECTIONS, SettingsBaseStore, baseApiPath } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { AssociatedSitesModel } from '../Models';
import { IAPIAssociatedSites } from '../Interfaces';
import { apiUrls } from './API.url';

export class SiteStore extends SettingsBaseStore {
  @observable public selectedAssociatedSite: AssociatedSitesModel = new AssociatedSitesModel();

  constructor(baseUrl?: string) {
    super(baseUrl || '');
  }

  /* istanbul ignore next */
  public getAssociatedSitesNoSqlById(request?: IAPIGridRequest): Observable<AssociatedSitesModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.ASSOCITED_SITES,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIAssociatedSites>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AssociatedSitesModel.deserialize(response.results[0]))
    );
  }
}
