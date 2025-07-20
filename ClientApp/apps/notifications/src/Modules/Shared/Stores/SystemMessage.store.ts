import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SystemMessageModel, SystemMessageTypeModel } from '../Models';
import { IAPISystemMessage } from '../Interfaces';
import { apiUrls } from './API.url';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class SystemMessageStore extends BaseStore {
  @observable public systemMessageTypes: SystemMessageTypeModel[] = [];
  @observable public systemMessages: SystemMessageModel[] = [];

  /* istanbul ignore next */
  public getSystemMessageTypes(): Observable<SystemMessageTypeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<string[]>>(`${apiUrls.systemMessage}/types`).pipe(
      Logger.observableCatchError,
      map(response => Utilities.customArraySort(SystemMessageTypeModel.deserializeList(response.Data), 'id')),
      tap((systemMessageTypes: SystemMessageTypeModel[]) => (this.systemMessageTypes = systemMessageTypes))
    );
  }

  /* istanbul ignore next */
  public getSystemMessages(): Observable<SystemMessageModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPISystemMessage>>(apiUrls.systemMessage).pipe(
      Logger.observableCatchError,
      map(response => Utilities.customArraySort(SystemMessageModel.deserializeList(response.Data), 'type')),
      tap((systemMessages: SystemMessageModel[]) => (this.systemMessages = systemMessages))
    );
  }

  /* istanbul ignore next */
  public upsertSystemMessage(systemMessage: SystemMessageModel): Observable<SystemMessageModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = systemMessage.id === 0;
    const upsertRequest: Observable<IAPIResponse<IAPISystemMessage>> = isNewRequest
      ? http.post<IAPIResponse<IAPISystemMessage>>(apiUrls.systemMessage, systemMessage.serialize())
      : http.put<IAPIResponse<IAPISystemMessage>>(apiUrls.systemMessage, systemMessage.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPISystemMessage>) => SystemMessageModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`System Message ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeSystemMessage({ id }: SystemMessageModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.delete<IAPIResponse<boolean>>(apiUrls.systemMessageById(id)).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<boolean>) => {
        !response.Data
          ? this.showAlertCritical('Failed to delete system message.', 'systemMessage')
          : AlertStore.info('System Message deleted successfully!');
      }),
      map((response: IAPIResponse<boolean>) => response.Data)
    );
  }
}
