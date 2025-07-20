import { Observable, of } from 'rxjs';
import { OptionKey, UvgoSettings } from '../Models';
import { UvgoSettingsStore } from '../Stores';

export class UvgoSettingStoreMock extends UvgoSettingsStore {
  public getUvgoSettings(): Observable<UvgoSettings[]> {
    return of([ new UvgoSettings(), new UvgoSettings() ])
  }

  public deleteUvgoSetting(key: string): Observable<boolean> {
    return of(true);
  }

  public upsertUvgoSettings(uvgoSetting: UvgoSettings): Observable<boolean> {
    return of(true);
  }

  public getOptionkeys(): Observable<OptionKey[]> {
    return of([ new OptionKey(), new OptionKey() ])
  }

}