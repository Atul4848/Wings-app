import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SyncHistoryModel } from '../Models';
import { SyncHistoryStore } from '../Stores';

export class SyncHistoryStoreMock extends SyncHistoryStore {
  public getSyncHistoryMock(): Observable<SyncHistoryModel[]> {
    return of([ new SyncHistoryModel(), new SyncHistoryModel() ]).pipe(
      tap(syncHistory => (this.syncHistory = syncHistory))
    );
  }
}
