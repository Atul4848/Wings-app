import { SessionStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { UserSessionModel } from '../Models';

export class SessionStoreMock extends SessionStore {

  public loadSessionUsers(id: string): Observable<UserSessionModel[]> {
    return of([ new UserSessionModel(), new UserSessionModel() ]);
  }

  public deleteSession(userId: string, session: UserSessionModel): Observable<string> {
    return of('');
  }
}
