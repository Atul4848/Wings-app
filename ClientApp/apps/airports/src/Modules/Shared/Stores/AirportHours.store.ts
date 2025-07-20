import {
  HttpClient,
  baseApiPath,
  NO_SQL_COLLECTIONS,
  BaseAirportStore,
} from '@wings/shared';
import { apiUrls } from './ApiUrls';
import { Observable, of } from 'rxjs';
import { map, takeUntil, tap, switchMap } from 'rxjs/operators';
import { action, observable } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { AirportHoursModel, IAPIAirportHours } from '../../Shared';
import { ATSAirportModel, ConditionModel } from '../Models';
import { IAPIATSAirport } from '../Interfaces';
import moment from 'moment';
import { AIRPORT_HOUR_FILTERS } from '../Enums';
import { Logger } from '@wings-shared/security';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  IAPIPageResponse,
  IAPITimeZoneBase,
  ISelectOption,
  TimeZoneBaseModel,
  Utilities,
} from '@wings-shared/core';
import {
  ScheduleModel,
  HoursTimeModel,
  RecurrenceModel,
  RecurrencePatternModel,
  DayOfWeekModel,
  SCHEDULE_TYPE,
} from '@wings-shared/scheduler';
export class AirportHoursStore extends BaseAirportStore {
  private readonly midNightTime: moment.Moment = moment().endOf('day');
  private readonly startOfDayTime: moment.Moment = moment().startOf('day');
  @observable public searchValue: string = '';
  @observable public searchChips: ISelectOption[] = [];
  @observable public searchTypeOption: AIRPORT_HOUR_FILTERS; // used to restore search value
  @observable public tfoAirports: ATSAirportModel[] = [];
  @observable public summaryHours: AirportHoursModel[] = [];
  @observable public airportHours: AirportHoursModel[] = [];
  @observable public associatedAirportHours: AirportHoursModel[] = [];
  @observable public otorAirportHours: AirportHoursModel[] = [];

  /* istanbul ignore next */
  // Check if OT/OR records can be created or not. TASK: 38632
  public canCreateOTORRecord = (airportHour: AirportHoursModel): boolean => {
    const { airportHoursType, airportHoursSubType, schedule, id } = airportHour;
    const { startTime, endTime, scheduleType } = schedule;
    if (
      Boolean(id) ||
      !Utilities.isEqual(scheduleType?.id || '', SCHEDULE_TYPE.RECURRENCE) ||
      !startTime?.time ||
      !endTime?.time
    ) {
      return false;
    }
    const _startTime = Utilities.getformattedDate(
      startTime.time,
      DATE_FORMAT.API_TIME_FORMAT
    );
    const _endTime = Utilities.getformattedDate(
      endTime.time,
      DATE_FORMAT.API_TIME_FORMAT
    );
    // check if start time and end time is not all day
    if (
      schedule.is24Hours ||
      ([ '00:01', '00:02' ].includes(_startTime) &&
        [ '23:58', '23:59' ].includes(_endTime))
    ) {
      return false;
    }
    const isOperational = (label: string): boolean => {
      return (
        Utilities.isEqual(label, 'operational') ||
        Utilities.isEqual(label, 'operational hours')
      );
    };
    return Boolean(
      isOperational(airportHoursType?.label || '') &&
        isOperational(airportHoursSubType?.label || '')
    );
  };

  // Created OT/OR records based on conditions SEE: 38632
  @action
  public createOTORHours(airportHoursModel: AirportHoursModel, cappsSequenceId: number): void {
    const { schedule, airportHoursType } = airportHoursModel;

    if (!Utilities.isEqual(airportHoursType?.label || '', 'operational')) {
      return;
    }
    const _startTime = moment(schedule.startTime.time, DATE_FORMAT.API_FORMAT);
    const _endTime = moment(schedule.endTime.time, DATE_FORMAT.API_FORMAT);
    const airportHours:AirportHoursModel[] = [];
    const startTimeDifference = _startTime.diff(this.startOfDayTime, 'minutes') > 2;

    if (startTimeDifference) {
      const otrOneStartTime: string = this.startOfDayTime.clone().add(1, 'minutes').format(DATE_FORMAT.API_FORMAT);
      const otrOneEndTime: string = _startTime.clone().subtract(1, 'minutes').format(DATE_FORMAT.API_FORMAT);
      airportHours.push(
        this.getAirportHours(
          otrOneStartTime,
          otrOneEndTime,
          airportHoursModel,
          cappsSequenceId + 1 // Add 1 for first record
        )
      );
    }

    const endTimeDifference = this.midNightTime.diff(_endTime, 'minutes') > 1;
    if (endTimeDifference) {
      const otrTwoStartTime: string = _endTime.clone().add(1, 'minutes').format(DATE_FORMAT.API_FORMAT);
      airportHours.push(
        this.getAirportHours(
          otrTwoStartTime,
          this.midNightTime.format(DATE_FORMAT.API_FORMAT),
          airportHoursModel,
          cappsSequenceId + (startTimeDifference ? 2 : 1) // Add 1 or 2 for second record based on time difference
        )
      );
    }
    this.otorAirportHours = airportHours;
  }

  private getAirportHours(
    startTime: string,
    endTime: string,
    airportHoursModel: AirportHoursModel,
    cappsSequenceId: number
  ): AirportHoursModel {
    return new AirportHoursModel({
      ...airportHoursModel,
      cappsSequenceId,
      tempId: Utilities.getTempId(),
      condition: new ConditionModel({ ...airportHoursModel.condition }),
      schedule: new ScheduleModel({
        ...airportHoursModel.schedule,
        startTime: new HoursTimeModel({ ...airportHoursModel.schedule.startTime, time: startTime }),
        endTime: new HoursTimeModel({ ...airportHoursModel.schedule.endTime, time: endTime }),
        patternedRecurrence: new RecurrenceModel({
          ...airportHoursModel.schedule?.patternedRecurrence,
          recurrencePattern: new RecurrencePatternModel({
            ...airportHoursModel.schedule?.patternedRecurrence?.recurrencePattern,
            daysOfWeeks: [
              ...(airportHoursModel.schedule?.patternedRecurrence?.recurrencePattern?.daysOfWeeks as DayOfWeekModel[]),
            ],
          }),
        }),
      }),
    });
  }

  /* istanbul ignore next */
  public loadAirportHoursById(airportHoursId: number): Observable<AirportHoursModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });

    return http.get<IAPIPageResponse<IAPIAirportHours>>(apiUrls.airportHoursById(airportHoursId)).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => AirportHoursModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public loadAirportHours(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirportHoursModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_HOUR,
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });

    return http.get<IAPIPageResponse<IAPIAirportHours>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => ({ ...response, results: AirportHoursModel.deserializeList(response.results) }))
    );
  }
  /* istanbul ignore next */
  public upsertAirportHours(airportHours: IAPIAirportHours[]): Observable<AirportHoursModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = Boolean(airportHours?.length && airportHours[0].id === 0);
    const upsertRequest: Observable<IAPIAirportHours> = isNewRequest
      ? http.post<IAPIAirportHours>(apiUrls.airportHours, airportHours)
      : http.put<IAPIAirportHours>(apiUrls.airportHours, airportHours);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAirportHours[]) => AirportHoursModel.deserializeList(response)),
      tap(() => AlertStore.info(`Airport Hour ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }
  /* istanbul ignore next */
  public removeAirportHours({ id }: AirportHoursModel): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.delete<string>(apiUrls.airportHours, { airportHourId: id }).pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Airport Hour deleted successfully!'))
    );
  }
  /* istanbul ignore next */
  public getAirportTimeZones(airportId: number): Observable<TimeZoneBaseModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.get<IAPITimeZoneBase[]>(apiUrls.airportTimezones(airportId)).pipe(
      Logger.observableCatchError,
      map(response => TimeZoneBaseModel.deserializeList(response))
    );
  }
  /* istanbul ignore next */
  public getTimeZoneById(timeZoneId: number): Observable<TimeZoneBaseModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.get<IAPITimeZoneBase>(apiUrls.timeZoneById(timeZoneId)).pipe(
      Logger.observableCatchError,
      map(response => TimeZoneBaseModel.deserialize(response))
    );
  }
  /* istanbul ignore next */
  public getAirportCurrentTimeZone(airportId: number): Observable<TimeZoneBaseModel | null> {
    return this.getAirportTimeZones(airportId).pipe(
      takeUntil(this.reset$),
      switchMap(airportTimeZones => {
        const airportCurrentTimeZone: TimeZoneBaseModel = Utilities.getCurrentTimeZone(airportTimeZones);
        if (!airportCurrentTimeZone) {
          return of(null);
        }
        return this.getTimeZoneById(airportCurrentTimeZone.timeZoneId);
      })
    );
  }

  /* istanbul ignore next */
  public loadTfoAirports(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<ATSAirportModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.TYPE_AHEAD_AIRPORT,
      ...request,
    });
    if (this.tfoAirports?.length && !forceRefresh) {
      return of(this.tfoAirports);
    }
    return http.get<IAPIPageResponse<IAPIATSAirport>>(`${apiUrls.referenceData}/uvgo?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ATSAirportModel.deserializeList(response.results)),
      tap((tfoAirports: ATSAirportModel[]) => (this.tfoAirports = tfoAirports))
    );
  }

  @action
  public reset(): void {
    this.airportHours = [];
    this.tfoAirports = [];
    this.otorAirportHours = [];
  }
}
