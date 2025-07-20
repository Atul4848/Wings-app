import { baseApiPath, HttpClient, SettingsBaseStore } from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CruiseScheduleModel, SettingsProfileModel } from '../Models';
import { IAPICruiseSchedule, IAPISettingsProfile } from '../Interfaces';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { tapWithAction, Utilities } from '@wings-shared/core';

export class SpeedScheduleSettingsStore extends SettingsBaseStore {
  @observable public cruiseSchedules: CruiseScheduleModel[] = [];
  @observable public climbSchedules: SettingsProfileModel[] = [];
  @observable public holdSchedules: SettingsProfileModel[] = [];
  @observable public descentSchedules: SettingsProfileModel[] = [];

  constructor() {
    super(baseApiPath.aircraft);
  }

  /* istanbul ignore next */
  public getCruiseSchedules(forceRefresh?: boolean): Observable<CruiseScheduleModel[]> {
    return this.getResult(
      apiUrls.cruiseSchedule,
      this.cruiseSchedules,
      forceRefresh,
      CruiseScheduleModel.deserializeList
    ).pipe(
      map(response => Utilities.customArraySort<CruiseScheduleModel>(response, 'profile')),
      tapWithAction(cruiseSchedules => (this.cruiseSchedules = cruiseSchedules))
    );
  }

  /* istanbul ignore next */
  public upsertCruiseSchedule(request: CruiseScheduleModel): Observable<CruiseScheduleModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPICruiseSchedule>(request.serialize(), apiUrls.cruiseSchedule, 'Cruise Schedule').pipe(
      map((response: IAPICruiseSchedule) => CruiseScheduleModel.deserialize(response)),
      tapWithAction((cruiseSchedule: CruiseScheduleModel) => {
        this.cruiseSchedules = Utilities.updateArray<CruiseScheduleModel>(this.cruiseSchedules, cruiseSchedule, {
          replace: !isNewRequest,
          predicate: t => t.id === cruiseSchedule.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getClimbSchedules(forceRefresh?: boolean): Observable<SettingsProfileModel[]> {
    return this.getResult(
      apiUrls.climbSchedule,
      this.climbSchedules,
      forceRefresh,
      SettingsProfileModel.deserializeList
    ).pipe(
      map(response => Utilities.customArraySort<SettingsProfileModel>(response, 'profile')),
      tapWithAction(climbSchedules => (this.climbSchedules = climbSchedules))
    );
  }

  /* istanbul ignore next */
  public upsertClimbSchedule(request: SettingsProfileModel): Observable<SettingsProfileModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPISettingsProfile>(request.serialize(), apiUrls.climbSchedule, 'Climb Schedule').pipe(
      map((response: IAPISettingsProfile) => SettingsProfileModel.deserialize(response)),
      tapWithAction((climbSchedule: SettingsProfileModel) => {
        this.climbSchedules = Utilities.updateArray<SettingsProfileModel>(this.climbSchedules, climbSchedule, {
          replace: !isNewRequest,
          predicate: t => t.id === climbSchedule.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getDescentSchedules(forceRefresh?: boolean): Observable<SettingsProfileModel[]> {
    return this.getResult(
      apiUrls.descentSchedule,
      this.descentSchedules,
      forceRefresh,
      SettingsProfileModel.deserializeList
    ).pipe(
      map(response => Utilities.customArraySort<SettingsProfileModel>(response, 'profile')),
      tapWithAction(descentSchedules => (this.descentSchedules = descentSchedules))
    );
  }

  /* istanbul ignore next */
  public upsertDescentSchedule(request: SettingsProfileModel): Observable<SettingsProfileModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPISettingsProfile>(request.serialize(), apiUrls.descentSchedule, 'Descent Schedule').pipe(
      map((response: IAPISettingsProfile) => SettingsProfileModel.deserialize(response)),
      tapWithAction((descentSchedule: SettingsProfileModel) => {
        this.descentSchedules = Utilities.updateArray<SettingsProfileModel>(this.descentSchedules, descentSchedule, {
          replace: !isNewRequest,
          predicate: t => t.id === descentSchedule.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getHoldSchedules(forceRefresh?: boolean): Observable<SettingsProfileModel[]> {
    return this.getResult(
      apiUrls.holdSchedule,
      this.holdSchedules,
      forceRefresh,
      SettingsProfileModel.deserializeList
    ).pipe(
      map(response => Utilities.customArraySort<SettingsProfileModel>(response, 'profile')),
      tapWithAction(holdSchedules => (this.holdSchedules = holdSchedules))
    );
  }

  /* istanbul ignore next */
  public upsertHoldSchedule(request: SettingsProfileModel): Observable<SettingsProfileModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPISettingsProfile>(request.serialize(), apiUrls.holdSchedule, 'Hold Schedule').pipe(
      map((response: IAPISettingsProfile) => SettingsProfileModel.deserialize(response)),
      tapWithAction((holdSchedule: SettingsProfileModel) => {
        this.holdSchedules = Utilities.updateArray<SettingsProfileModel>(this.holdSchedules, holdSchedule, {
          replace: !isNewRequest,
          predicate: t => t.id === holdSchedule.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public deleteSchedule(id: number, typeKey: string, type: string): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http.delete<string>(apiUrls[typeKey], { [`${typeKey}Id`]: id }).pipe(
      Logger.observableCatchError,
      map(() => `${type} deleted successfully!`),
      tapWithAction(response => {
        AlertStore.info(response);
        this[`${typeKey}s`] = (this[`${typeKey}s`] as SettingsProfileModel[]).filter(x => x.id !== id);
      })
    );
  }
}
