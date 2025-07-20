import { AircraftVariationStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AircraftVariationModel } from '../Models';
import { tap } from 'rxjs/operators';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class AircraftVariationStoreMock extends AircraftVariationStore {
  public getAircraftVariations(request?: IAPIGridRequest): Observable<IAPIPageResponse<AircraftVariationModel>> {
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 2,
      results: [ new AircraftVariationModel(), new AircraftVariationModel() ],
    }).pipe(tap(response => (this.aircraftVariations = response.results)));
  }

  /* istanbul ignore next */
  public getAircraftVariationById(request?: IAPIGridRequest): Observable<AircraftVariationModel> {
    return of(new AircraftVariationModel({ pictureUrl: 'https://google.com' }));
  }

  public validateUnique(request: AircraftVariationModel): Observable<{ isValid: boolean }> {
    return of({ isValid: true });
  }
}
