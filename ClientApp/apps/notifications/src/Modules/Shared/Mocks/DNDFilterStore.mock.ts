import { IAPIPagedUserRequest } from '@wings/user-management/src/Modules';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DAYS_OF_WEEK } from '../Enums';
import { DNDFilterModel, DayOfWeekModel, EventTypeModel, UserModel } from '../Models';
import { DNDFilterStore } from '../Stores';

export class DNDFilterStoreMock extends DNDFilterStore {
  public getDNDFilters(): Observable<DNDFilterModel[]> {
    return of([ new DNDFilterModel(), new DNDFilterModel() ]).pipe(tap(dndFilters => (this.dndFilters = dndFilters)));
  }

  public removeDNDFilter({ id }: DNDFilterModel): Observable<boolean> {
    return of(true);
  }

  public loadDNDFilterById(id: number): Observable<DNDFilterModel> {
    return of(
      new DNDFilterModel({
        id: 1,
        startTime: '06:00',
        stopTime: '20:00',
        daysOfWeek: [ new DayOfWeekModel({ id: DAYS_OF_WEEK.MONDAY, name: DAYS_OF_WEEK.MONDAY }) ],
        eventTypeIds: [ 1, 2 ],
        eventTypes: [ new EventTypeModel() ],
        oktaUserId: 'test1',
        oktaUsername: 'test1',
        oktaUser: new UserModel({ id: 'test', email: 'test@email.com' }),
      })
    );
  }

  public upsertDNDFilter(dndFilter: DNDFilterModel): Observable<DNDFilterModel> {
    return of(new DNDFilterModel());
  }

  public loadUsers(request?: IAPIPagedUserRequest): Observable<UserModel[]> {
    return of([ new UserModel(), new UserModel() ]).pipe(tap(users => (users)));
  }
}
