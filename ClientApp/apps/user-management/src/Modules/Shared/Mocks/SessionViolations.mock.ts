import { SessionViolationsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { SessionViolationsModel } from '../Models';

export class SessionViolationsMock extends SessionViolationsStore {

  public getSessionViolations(): Observable<SessionViolationsModel[]> {
    return of([ new SessionViolationsModel(), new SessionViolationsModel() ]);
  }

  public deleteSessionViolations(userId: string): Observable<string> {
    return of('');
  }
}
