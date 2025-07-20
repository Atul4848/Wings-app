import { Observable, of } from 'rxjs';
import { FlightPlanningServiceModel } from '../Models';
import { FlightPlanningServiceStore } from '../Stores';
import { IAPIGridRequest, IAPIPageResponse, SettingsTypeModel } from '@wings-shared/core';

export class FlightPlanningServiceStoreMock extends FlightPlanningServiceStore {
  /* istanbul ignore next */
  public getFlightPlanningServices(forceRefresh?: boolean): Observable<IAPIPageResponse<FlightPlanningServiceModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 2,
      results: [ new FlightPlanningServiceModel(), new FlightPlanningServiceModel() ],
    });
  }

  /* istanbul ignore next */
  public removeFlightPlanningService(customersWithNonStandardRunwayAnalysisId: number): Observable<string> {
    return of('Success');
  }

  /* istanbul ignore next */
  public upsertFlightPlanningService(data: FlightPlanningServiceModel): Observable<FlightPlanningServiceModel> {
    return of(new FlightPlanningServiceModel());
  }

  /* istanbul ignore next */
  public getCustomers(request?: IAPIGridRequest): Observable<IAPIPageResponse<SettingsTypeModel>> {
    return of({
      pageNumber: 2,
      pageSize: 2,
      totalNumberOfRecords: 2,
      results: [ new SettingsTypeModel() ],
    });
  }
}
