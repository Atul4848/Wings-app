import { baseApiPath, HttpClient } from '@wings/shared';
import { tap, map } from 'rxjs/operators';
import moment from 'moment';
import { Observable } from 'rxjs';
import { AirportModel } from '../Models';
import { IAPIAirport } from '../Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { apiUrls } from './API.url';
import { TimeZoneStore } from './TimeZone.store';
import { APPROVE_REJECT_ACTIONS } from '../Enums';
import { Logger } from '@wings-shared/security';

export class TimeZoneReviewStore extends TimeZoneStore {
  /* istanbul ignore next */
  public approveRejectTimeZones(stagingTimeZoneIds: number[], action: APPROVE_REJECT_ACTIONS): Observable<string[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const { APPROVE } = APPROVE_REJECT_ACTIONS;
    const url = action === APPROVE ? apiUrls.timezoneApprove : apiUrls.timezoneReject;
    return http
      .post<string[]>(url, { stagingTimeZoneIds })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info(`Time Zone ${action === APPROVE ? 'approved' : 'rejected'} successfully!`))
      );
  }

  /* istanbul ignore next */
  public approveRejectStagingAirportTimezones(
    stagingAirportRegionIds: number[],
    action: APPROVE_REJECT_ACTIONS
  ): Observable<string[]> {
    const { APPROVE } = APPROVE_REJECT_ACTIONS;
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const url = action === APPROVE ? apiUrls.approveStagingAirportRegion : apiUrls.rejectStagingAirportRegion;
    return http
      .put<string[]>(url, { stagingAirportRegionIds })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info(`Airport Time Zone ${action === APPROVE ? 'approved' : 'rejected'} successfully!`))
      );
  }

  /* istanbul ignore next */
  public getTimeZoneAirports(isStagingTimezones: boolean, id: number): Observable<AirportModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const requestUrl = isStagingTimezones ? apiUrls.stagingTimezoneAirports(id) : apiUrls.timezoneAirports(id);
    return http.get<IAPIAirport[]>(`${requestUrl}`).pipe(map(response => AirportModel.deserializeList(response)));
  }

  /* istanbul ignore next */
  public refreshTimeZones(): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const currentYear = moment().year();
    return http
      .post<string>(apiUrls.timezoneRefresh, { years: [ currentYear, currentYear + 1 ] })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Time Zone refreshed successfully!')));
  }
}
