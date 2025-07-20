import { Observable, of } from 'rxjs';
import { IAPISyncSettings } from '../Interfaces';
import { SyncSettingsModel } from '../Models';
import { SyncSettingsStore } from '../Stores';

export class SyncSettingsStoreMock extends SyncSettingsStore {
  public getSyncSettings(): Observable<SyncSettingsModel[]> {
    return of([ new SyncSettingsModel(), new SyncSettingsModel() ])
  }

  public upsertSyncSettings(request: IAPISyncSettings): Observable<boolean>{
    return of(true);
  }

  public resetSyncSettings(key: string): Observable<boolean> {
    return of(true);
  }

}