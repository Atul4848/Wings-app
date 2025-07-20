import { SpeedScheduleSettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CruiseScheduleModel, SettingsProfileModel } from '../Models';

export class SpeedScheduleSettingsStoreMock extends SpeedScheduleSettingsStore {
  public getCruiseSchedules(): Observable<CruiseScheduleModel[]> {
    return of([ new CruiseScheduleModel(), new CruiseScheduleModel() ]).pipe(
      tap(cruiseSchedules => (this.cruiseSchedules = cruiseSchedules))
    );
  }

  public upsertCruiseSchedule(request: CruiseScheduleModel): Observable<CruiseScheduleModel> {
    return of(new CruiseScheduleModel());
  }

  public getClimbSchedules(): Observable<SettingsProfileModel[]> {
    return of([ new SettingsProfileModel(), new SettingsProfileModel() ]).pipe(
      tap(climbSchedules => (this.climbSchedules = climbSchedules))
    );
  }

  public upsertClimbSchedule(request: SettingsProfileModel): Observable<SettingsProfileModel> {
    return of(new SettingsProfileModel());
  }

  public getDescentSchedules(): Observable<SettingsProfileModel[]> {
    return of([ new SettingsProfileModel(), new SettingsProfileModel() ]).pipe(
      tap(descentSchedules => (this.descentSchedules = descentSchedules))
    );
  }

  public upsertDescentSchedule(request: SettingsProfileModel): Observable<SettingsProfileModel> {
    return of(new SettingsProfileModel());
  }

  public getHoldSchedules(): Observable<SettingsProfileModel[]> {
    return of([ new SettingsProfileModel(), new SettingsProfileModel() ]).pipe(
      tap(holdProfiles => (this.holdSchedules = holdProfiles))
    );
  }

  public upsertHoldSchedule(request: SettingsProfileModel): Observable<SettingsProfileModel> {
    return of(new SettingsProfileModel());
  }
}
