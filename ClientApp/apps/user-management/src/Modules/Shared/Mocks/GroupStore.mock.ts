import { GroupStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { UserGroupModel } from '../Models';
import { IAPIUserGroupsRequest } from '../Interfaces';

export class GroupStoreMock extends GroupStore {

  public loadGroups(search?: string): Observable<UserGroupModel[]> {
    return of([ new UserGroupModel() ]);
  }

  public upsertGroup(upsertGroupRequest: IAPIUserGroupsRequest): Observable<UserGroupModel> {
    return of(new UserGroupModel());
  }

  public deleteRelease(id: string): Observable<boolean> {
    return of(true);
  }
}
