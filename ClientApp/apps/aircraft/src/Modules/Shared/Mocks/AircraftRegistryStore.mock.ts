import { AircraftRegistryStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { RegistrySequenceBaseModel } from '../Models';
import { tap } from 'rxjs/operators';

export class AircraftRegistryStoreMock extends AircraftRegistryStore {
  public getAirframes(): Observable<RegistrySequenceBaseModel[]> {
    return of([ new RegistrySequenceBaseModel() ]).pipe(
      tap(equipments => (this.equipments = equipments))
    );
  }
}