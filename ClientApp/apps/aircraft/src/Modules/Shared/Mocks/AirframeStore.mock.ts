import { AirframeStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AirframeModel } from '../Models';
import { tap } from 'rxjs/operators';

export class AirframeStoreMock extends AirframeStore {
  public getAirframes(): Observable<AirframeModel[]> {
    return of([ new AirframeModel() ]).pipe(tap(airframes => (this.airframes = airframes)));
  }
}
