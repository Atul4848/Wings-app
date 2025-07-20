import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { IAPIResponse } from '../../../../../airport-logistics/src/Modules/Shared';
import { IAPIContactResponse, IAPIUpsertContactRequest } from '../Interfaces';
import { ContactModel } from '../Models';
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

export class ContactStore extends BaseStore {
  @observable public contacts: ContactModel[] = [];

  /* istanbul ignore next */
  public loadContacts(customerNumber: string): Observable<ContactModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIContactResponse[]>>(`${apiUrls.contacts}?customerNumber=${customerNumber}`)
      .pipe(
        Logger.observableCatchError,
        map(
          (response: IAPIResponse<IAPIContactResponse[]>) =>
            Utilities.customArraySort<ContactModel>(
              ContactModel.deserializeList(response.Data),
              'name'
            )),
        tap((contacts: ContactModel[]) => (this.contacts = contacts))
      );
  }

  /* istanbul ignore next */
  public upsertContact(request: IAPIUpsertContactRequest): Observable<ContactModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = request.ContactId === 0;
    const upsertRequest = isNewRequest
      ? http.post<IAPIResponse<IAPIContactResponse>>(`${apiUrls.contacts}`, request)
      : http.put<IAPIResponse<IAPIContactResponse>>(`${apiUrls.contacts}`, request);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIContactResponse>) => ContactModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Contact ${isNewRequest ? 'added' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteContact(contactId: number): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.contacts}/${contactId}`)
      .pipe(
        Logger.observableCatchError,
        map((response: IAPIResponse<boolean>) => response.Data)
      );
  }

  /* istanbul ignore next */
  public getContact(contactId: number): Observable<ContactModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIContactResponse>>(`${apiUrls.contacts}/${contactId}`)
      .pipe(
        Logger.observableCatchError,
        map(
          (response: IAPIResponse<IAPIContactResponse>) =>
            ContactModel.deserialize(response.Data)
        )
      )
  }
}
