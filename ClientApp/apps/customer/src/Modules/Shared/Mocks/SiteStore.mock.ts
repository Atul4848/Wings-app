import { SiteStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AssociatedSitesModel } from '../Models';
import { IAPIGridRequest } from '@wings-shared/core';

export class SiteStoreMock extends SiteStore {
  public getAssociatedSitesNoSqlById(request: IAPIGridRequest): Observable<AssociatedSitesModel> {
    return of(new AssociatedSitesModel());
  }
}
