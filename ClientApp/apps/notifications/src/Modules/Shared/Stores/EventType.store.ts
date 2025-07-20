import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EventTypeModel } from '../Models';
import { IAPIDeleteResponse, IAPIEventType, IAPIEventTypeResponse } from '../Interfaces';
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

export class EventTypeStore extends BaseStore {
  @observable public eventTypes: EventTypeModel[] = [];

  /* istanbul ignore next */
  public getEventTypes(): Observable<EventTypeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIEventTypeResponse>(apiUrls.eventType).pipe(
      Logger.observableCatchError,
      map(response => Utilities.customArraySort(EventTypeModel.deserializeList(response.Data), 'name')),
      tap((eventTypes: EventTypeModel[]) => (this.eventTypes = eventTypes))
    );
  }

  /* istanbul ignore next */
  public upsertEventType(eventType: EventTypeModel): Observable<EventTypeModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = eventType.id === 0;
    const upsertRequest: Observable<IAPIResponse<IAPIEventType>> = isNewRequest
      ? http.post<IAPIResponse<IAPIEventType>>(apiUrls.eventType, eventType.serialize())
      : http.put<IAPIResponse<IAPIEventType>>(apiUrls.eventType, eventType.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIEventType>) => EventTypeModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`EventType ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeEventType({ id }: EventTypeModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });

    return http.delete<IAPIResponse<IAPIDeleteResponse>>(apiUrls.eventTypeById(id)).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<IAPIDeleteResponse>) => {
        !response.Data.Success
          ? this.showAlertCritical(response.Data.Message, 'eventtype')
          : AlertStore.info('EventType deleted successfully!');
      }),
      map((response: IAPIResponse<IAPIDeleteResponse>) => response.Data.Success)
    );
  }

  /* istanbul ignore next */
  public loadEventTypeById(id: number): Observable<EventTypeModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIEventType>>(apiUrls.eventTypeById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIEventType>) => EventTypeModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public getPreviewDate(format: string = 'MMM. d, yyyy'): Observable<string> {
    const params = Utilities.buildParamString({
      format,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<string>>(`${apiUrls.eventType}/preview/date?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<string>) => response.Data)
    );
  }
}
