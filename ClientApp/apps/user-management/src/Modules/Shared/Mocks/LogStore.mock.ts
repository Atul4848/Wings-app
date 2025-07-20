import { LogStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { LogModel } from '../Models';
import { IAPILogResponse, IAPIPagedUserRequest } from '../Interfaces';
import { UserModel } from '@wings/notifications/src/Modules';
import { tap } from 'rxjs/operators';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class LogStoreMock extends LogStore {
  public getLog(request?: IAPIGridRequest): Observable<IAPIPageResponse<LogModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 1,
      results: [ new LogModel(), new LogModel() ],
    })
  }

  public upsertLog(request: IAPILogResponse): Observable<LogModel> {
    return of(new LogModel());
  }

  public loadUsers(request?: IAPIPagedUserRequest): Observable<UserModel[]> {
    return of([ new UserModel(), new UserModel() ]).pipe(tap(users => (users)));
  }

}
