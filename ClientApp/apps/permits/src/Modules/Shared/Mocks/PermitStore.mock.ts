import { PermitStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AerodromeReferenceCodeModel, PermitModel, PermitExceptionRuleModel } from '../Models';
import { CountryModel, AirportModel, StateModel } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, SettingsTypeModel } from '@wings-shared/core';

export class PermitStoreMock extends PermitStore {
  public loadPermits(request?: IAPIGridRequest): Observable<IAPIPageResponse<PermitModel>> {
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 1,
      results: [ new PermitModel() ],
    });
  }

  public upsertPermit(permit: PermitModel): Observable<PermitModel> {
    return of(new PermitModel());
  }

  public getCountries(forceRefresh?: boolean): Observable<CountryModel[]> {
    return of([
      new CountryModel({ id: 10, isO2Code: 'IN' }),
      new CountryModel({ id: 15, isO2Code: 'TEST' }),
      new CountryModel(),
    ]).pipe(tapWithAction((countries: CountryModel[]) => (this.countries = countries)));
  }

  public getPermits(request?: IAPIGridRequest): Observable<PermitModel[]> {
    return of([
      new PermitModel({ id: 10, country: new CountryModel({ id: 5 }), permitType: new SettingsTypeModel({ id: 1 }) }),
      new PermitModel({ id: 1, exception: 'TEST', permitExceptionRules: [ new PermitExceptionRuleModel() ] }),
    ]).pipe(tapWithAction((permits: PermitModel[]) => (this.permits = permits)));
  }

  public getWingsAirports(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirportModel>> {
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 1,
      results: [ new AirportModel() ],
    });
  }

  public getStates(request?: IAPIGridRequest): Observable<StateModel[]> {
    return of([
      new StateModel({ id: 10, code: 'PB' }),
      new StateModel({ id: 15, code: 'TEST' }),
      new StateModel(),
    ]).pipe(tapWithAction((states: StateModel[]) => (this.states = states)));
  }

  public getRegions(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((regions: SettingsTypeModel[]) => {
        this.regions = regions;
      })
    );
  }

  public getAerodromeReferenceCodes(): Observable<AerodromeReferenceCodeModel[]> {
    return of([ new AerodromeReferenceCodeModel({ id: 1, code: 'TEST' }), new AerodromeReferenceCodeModel() ]).pipe(
      tapWithAction((aerodromeReferenceCodes: AerodromeReferenceCodeModel[]) => {
        this.aerodromeReferenceCodes = aerodromeReferenceCodes;
      })
    );
  }

  public getAircraftCategories(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((aircraftCategories: SettingsTypeModel[]) => {
        this.aircraftCategories = aircraftCategories;
      })
    );
  }

  public isPermitExists(request: IAPIGridRequest, permitId: Number): Observable<boolean> {
    return of(false);
  }
}
