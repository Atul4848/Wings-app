import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIScottIPCResponse, IAPIUpsertScottIPCRequest, IAPICappsPersonResponse } from '../Interfaces';
import { ScottIPCModel, CappsPersonModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class ScottIPCStore extends BaseStore {
  /* istanbul ignore next */
  public getScottIpc(request?: IAPIGridRequest): Observable<IAPIPageResponse<ScottIPCModel>> {
    const params = Utilities.buildParamString({
      searchValue: request?.searchCollection || '',
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.flightPlanningUrl, headers });
    return http.get<IAPIPageResponse<IAPIScottIPCResponse>>(`${apiUrls.scottIpc}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return {
          totalNumberOfRecords: response.meta.totalItemCount,
          pageNumber: response.meta.pageNumber,
          pageSize: response?.meta.pageSize,
          results: Utilities.customArraySort<ScottIPCModel>(
            ScottIPCModel.deserializeList(response.data),
            'uwaAccountNumber'
          ),
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertScottIpc(request: IAPIUpsertScottIPCRequest): Observable<ScottIPCModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.flightPlanningUrl, headers });
    const isNewRequest: boolean = !Boolean(request.Id);
    const upsertRequest: Observable<IAPIResponse<IAPIScottIPCResponse>> = isNewRequest
      ? http.post<IAPIResponse<IAPIScottIPCResponse>>(apiUrls.scottIpc, request)
      : http.put<IAPIResponse<IAPIScottIPCResponse>>(apiUrls.scottIpc, request);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIScottIPCResponse>) => ScottIPCModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Scott IPC mapping ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteScottIpc(Id: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.flightPlanningUrl, headers });
    return http.delete(`${apiUrls.scottIpc}?id=${Id}`, '').pipe(
      Logger.observableCatchError,
      map(response => response.Archived)
    );
  }

  /* istanbul ignore next */
  public getCappsPerson(fullName: string, customerNumber: string): Observable<CappsPersonModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.flightPlanningUrl, headers });

    return http
      .get<IAPICappsPersonResponse[]>(
        `${apiUrls.cappsPersonCustomer}?fullName=${fullName}&customerNumber=${customerNumber}`
      )
      .pipe(
        Logger.observableCatchError,
        map((response: any) =>
          Utilities.customArraySort<CappsPersonModel>(CappsPersonModel.deserializeList(response.data), 'personId')
        )
      );
  }

  /* istanbul ignore next */
  public updatePersonId(id: string, personId: number): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.flightPlanningUrl, headers });
    return http.put<IAPIResponse<boolean>>(`${apiUrls.personId}?id=${id}&personId=${personId}`, '').pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<boolean>) => {
        if (response.data) {
          AlertStore.info('Person ID updated successfully!');
          return;
        }
        AlertStore.info('Failed to update Person ID');
      }),
      map((response: IAPIResponse<boolean>) => response.data)
    );
  }
}
