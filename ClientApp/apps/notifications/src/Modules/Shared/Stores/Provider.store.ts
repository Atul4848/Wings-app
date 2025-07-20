import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { apiUrls } from './API.url';
import { IAPIProviderResponse } from '../Interfaces';
import { ProviderModel } from '../Models';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class ProviderStore extends BaseStore{
    @observable public providers: ProviderModel[] = [];

    /* istanbul ignore next */
    public getProviders(): Observable<ProviderModel[]> {
      const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
      return http.get<IAPIProviderResponse>(apiUrls.providers).pipe(
        Logger.observableCatchError,
        map(response => Utilities.customArraySort(ProviderModel.deserializeList(response.Data), 'name')),
        tap((providers: ProviderModel[]) => (this.providers = providers))
      );
    }
}
