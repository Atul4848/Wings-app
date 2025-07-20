import { HttpClient, BaseStore, baseApiPath } from '@wings/shared';
import { apiUrls } from './ApiUrls';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { AirportMappingsModel } from '../Models';
import { IAPIAirportMappings } from '../Interfaces';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';

export class AirportMappingStore extends BaseStore {
  /* istanbul ignore next */
  public loadAirportMappings(request?: IAPIGridRequest): Observable<IAPIPageResponse<AirportMappingsModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });

    const agGridRequest: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      sortCollection: JSON.stringify([{ propertyName: 'Icao', isAscending: true }]),
      searchCollection: JSON.stringify([{ propertyName: 'Icao', propertyValue: '' }]),
      ...request,
    };

    const sort = JSON.parse(agGridRequest.sortCollection || '')[0];
    const search = JSON.parse(agGridRequest.searchCollection || '')[0];

    const params = Utilities.buildParamString({
      page: agGridRequest.pageNumber,
      size: agGridRequest.pageSize,
      orderby: sort.propertyName,
      dir: sort.isAscending ? 1 : 2,
      query: search.propertyValue,
    });

    return http.get<IAPIPageResponse<IAPIAirportMappings>>(`${apiUrls.airportMapping}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => {
        return {
          totalNumberOfRecords: response.Data.Meta.TotalItemCount,
          pageNumber: response.Data.Meta.PageNumber,
          pageSize: response?.Data.Meta.PageSize,
          results: AirportMappingsModel.deserializeList(response.Data.Result),
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertAirportMapping(request: AirportMappingsModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const isNewRequest: boolean = !Boolean(request.id);

    const upsertRequest: Observable<IAPIResponse<IAPIAirportMappings>> = isNewRequest
      ? http.post<IAPIResponse<IAPIAirportMappings>>(`${apiUrls.airportMapping}`, request.serialize())
      : http.put<IAPIResponse<IAPIAirportMappings>>(`${apiUrls.airportMapping}`, request.serialize());
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: any) => response.Data),
      tap(() => AlertStore.info(`Mapping ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeAirportMapping(icao: string): Observable<string> {
    const params = Utilities.buildParamString({
      icao: icao,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<string>(`${apiUrls.airportMapping}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Mapping deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public ValidateIcaoCode(value: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<string>(`${apiUrls.airportMapping}/validate/icao?icao=${value}`).pipe(
      Logger.observableCatchError,
      map((response: any) => response?.Data)
    );
  }
}
