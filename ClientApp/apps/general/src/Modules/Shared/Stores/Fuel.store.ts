import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIFuelResponse, IAPIUpsertFuelRequest } from '../Interfaces';
import { FuelModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.FLIGHT_PLANNING_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class FuelStore extends BaseStore {

  /* istanbul ignore next */
  public getFuel(request?: IAPIGridRequest): Observable<IAPIPageResponse<FuelModel>> {
    const params = Utilities.buildParamString({
      searchValue: request?.searchCollection || '',
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.fuelUrl, headers });
    return http.get<IAPIPageResponse<IAPIFuelResponse>>(`${apiUrls.fuels}?${params}`).pipe(
      Logger.observableCatchError,
      map((response) => {
        return {
          totalNumberOfRecords: response.Meta.TotalItemCount,
          pageNumber: response.Meta.PageNumber,
          pageSize: response?.Meta.PageSize,
          results: Utilities.customArraySort<FuelModel>(FuelModel.deserializeList(response.Data), 'uwaCustomerId')
        }
      })
    )
  }

  /* istanbul ignore next */
  public upsertFuel(request: IAPIUpsertFuelRequest): Observable<FuelModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.fuelUrl, headers });
    const isNewRequest: boolean = !Boolean(request.Id);
    const params = Utilities.buildParamString({
      id: request.Id,
    });
    const upsertRequest: Observable<IAPIResponse<IAPIFuelResponse>> = isNewRequest
      ? http.post<IAPIResponse<IAPIFuelResponse>>(apiUrls.fuels, request)
      : http.put<IAPIResponse<IAPIFuelResponse>>(`${apiUrls.fuels}?${params}`, request);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIFuelResponse>) =>
        FuelModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Fuel ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteFuel(Id: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.fuelUrl, headers });
    return http.put(`${apiUrls.fuels}/archive?customerId=${Id}`, '')
      .pipe(
        Logger.observableCatchError,
        map((response) => response.Archived)
      );
  }
}