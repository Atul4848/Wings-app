import { baseApiPath, HttpClient } from '@wings/shared';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AirportTimeZoneMappingModel } from '../Models';
import { IAPIAirportTimeZoneMapping } from '../Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { apiUrls } from './API.url';
import { TimeZoneStore } from './TimeZone.store';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';

export class AirportTimeZoneMappingStore extends TimeZoneStore {
  /* istanbul ignore next */
  public getAirportTimeZoneMapping(
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<AirportTimeZoneMappingModel[]>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    const apiUrl = `${apiUrls.timeZoneMapping}?${params}`;
    return http.get<IAPIPageResponse<IAPIAirportTimeZoneMapping>>(apiUrl).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: AirportTimeZoneMappingModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public upsertAirportTimeZoneMapping(timeZone: IAPIAirportTimeZoneMapping): Observable<AirportTimeZoneMappingModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });

    const isNewRequest: boolean = timeZone.id === 0;
    const upsertRequest: Observable<IAPIAirportTimeZoneMapping> = isNewRequest
      ? http.post<IAPIAirportTimeZoneMapping>(apiUrls.timeZoneMapping, timeZone)
      : http.put<IAPIAirportTimeZoneMapping>(`${apiUrls.timeZoneMapping}/${timeZone.id}`, timeZone);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAirportTimeZoneMapping) => AirportTimeZoneMappingModel.deserialize(response)),
      tap(() => AlertStore.info(`Time Zone ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeAirportTimeZoneMapping(id: number): Observable<string> {
    const params = {
      id: id,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.timezones });
    return http.delete<string>(`${apiUrls.timeZoneMapping}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Airport TimeZone Mapping deleted successfully!'))
    );
  }
}
