import { baseApiPath, BaseStore, HttpClient, IAPIResponse } from '@wings/shared';
import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChannelModel } from '../Models';
import { IAPIChannel, IAPIChannelResponse, IAPIDeleteResponse } from '../Interfaces';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class ChannelStore extends BaseStore {
  @observable public channels: ChannelModel[] = [];

  /* istanbul ignore next */
  public getChannels(): Observable<ChannelModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIChannelResponse>(apiUrls.channel).pipe(
      Logger.observableCatchError,
      map(response => Utilities.customArraySort(ChannelModel.deserializeList(response.Data), 'name')),
      tap((channels: ChannelModel[]) => (this.channels = channels))
    );
  }

  /* istanbul ignore next */
  public upsertChannel(channel: ChannelModel): Observable<ChannelModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = channel.id === 0;
    const upsertRequest: Observable<IAPIResponse<IAPIChannel>> = isNewRequest
      ? http.post<IAPIResponse<IAPIChannel>>(apiUrls.channel, channel.serialize())
      : http.put<IAPIResponse<IAPIChannel>>(apiUrls.channel, channel.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIChannel>) => ChannelModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Channel ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeChannel({ id }: ChannelModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });

    return http.delete<IAPIResponse<boolean>>(apiUrls.deleteChannel(id)).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<IAPIDeleteResponse>) => {
        !response.Data.Success
          ? this.showAlertCritical(response.Data.Message, 'channel')
          : AlertStore.info('Channel deleted successfully!');
      }),
      map((response: IAPIResponse<IAPIDeleteResponse>) => response.Data.Success)
    );
  }

  /* istanbul ignore next */
  public getPublicChannels(): ChannelModel[] {
    return this.channels.filter(channel => channel.publicEnabled);
  }
}
