import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { IAPIEvent } from '../Interfaces';
import { EventModel } from '../Models';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { apiUrls } from './API.url';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class EventStore extends BaseStore {
  @observable public events: EventModel[] = [];

  /* istanbul ignore next */
  public getEvents(): Observable<EventModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIEvent[]>>(apiUrls.event).pipe(
      Logger.observableCatchError,
      map(response => EventModel.deserializeList(response.Data)),
      tap((events: EventModel[]) => (this.events = events))
    );
  }

  /* istanbul ignore next */
  public upsertEvent(event: EventModel): Observable<EventModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = event.id === 0;
    const upsertRequest: Observable<IAPIResponse<IAPIEvent>> = isNewRequest
      ? http.post<IAPIResponse<IAPIEvent>>(apiUrls.event, event.serialize())
      : http.put<IAPIResponse<IAPIEvent>>(apiUrls.event, event.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIEvent>) => EventModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Event ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeEvent({ id }: EventModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });

    return http.delete<IAPIResponse<boolean>>(apiUrls.eventById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => {
        return response.Data;
      }),
      tap(() => AlertStore.info('Event deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public loadEventById(id: number): Observable<EventModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIEvent>>(apiUrls.eventById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIEvent>) => EventModel.deserialize(response.Data))
    );
  }
}
