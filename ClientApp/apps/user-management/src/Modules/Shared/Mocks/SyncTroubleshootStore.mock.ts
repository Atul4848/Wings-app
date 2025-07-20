import { Observable, of } from 'rxjs';
import { SyncTroubleshootStore } from '../Stores';

export class SyncTroubleshootStoreMock extends SyncTroubleshootStore {
  refreshOktaProfiles(): Observable<any> {
    return of('');
  }
  refreshUsersCache(): Observable<any> {
    return of('');
  }
  resyncUser(): Observable<any> {
    return of('');
  }
}
