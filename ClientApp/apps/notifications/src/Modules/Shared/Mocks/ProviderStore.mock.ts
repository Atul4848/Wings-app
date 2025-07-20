import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProviderModel } from '../Models';
import { ProviderStore } from '../Stores';

export class ProviderStoreMock extends ProviderStore {
  public getProviders(): Observable<ProviderModel[]> {
    return of([ new ProviderModel(), new ProviderModel() ]).pipe(tap(providers => (this.providers = providers)));
  }
}
