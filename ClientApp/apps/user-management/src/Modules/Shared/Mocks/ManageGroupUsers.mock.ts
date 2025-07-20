import { GroupStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { GroupsUsersModel } from '../Models';

export class ManageGroupUsersMock extends GroupStore {

  public loadGroupUsers(id: string): Observable<GroupsUsersModel[]> {
    return of([ new GroupsUsersModel() ]);
  }
  
}
