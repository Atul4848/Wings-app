import { Observable, of } from 'rxjs';
import { ActiveUserModel } from '../Models';
import { ActiveUsersStore } from '../Stores';

export class ActiveUserStoreMock extends ActiveUsersStore {
  public getActiveUsers(): Observable<ActiveUserModel[]> {
    return of([ new ActiveUserModel(), new ActiveUserModel() ])
  }
}