import { IAPIPagedUserRequest } from '@wings/user-management/src/Modules';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IAPIUpdtateSubscriptionRequest } from '..';
import { UserModel, UserSubscriptionModel } from '../Models';
import { SubscriptionStore } from '../Stores';

export class UserSubscriptionStoreMock extends SubscriptionStore {
  public loadUsers(request?: IAPIPagedUserRequest): Observable<UserModel[]> {
    return of([ new UserModel(), new UserModel() ]).pipe(tap(users => (this.users = users)));
  }

  public userSubscriptions(customerNumber: string): Observable<UserSubscriptionModel[]> {
    return of([ new UserSubscriptionModel() ]);
  }

  public toggleSubscriptionActivation(request: IAPIUpdtateSubscriptionRequest): Observable<UserSubscriptionModel> {
    return of(new UserSubscriptionModel());
  }

  public setDefaultValue(): void {
    this.selectedUser = new UserModel({ id: 'test' });
  }

  public searchSubscriptions(
    searchValue: string,
    isEnabled: boolean = false,
    includeInactive = false
  ): Observable<UserSubscriptionModel[]> {
    return of([ new UserSubscriptionModel(), new UserSubscriptionModel() ]);
  }
}
