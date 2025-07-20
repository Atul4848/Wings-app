import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { FeatureNoteModel } from '../Models';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { IAPIFeatureNote } from '../Interfaces';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class FeatureNoteStore extends BaseStore {
  @observable public featureNotes: FeatureNoteModel[] = [];

  /* istanbul ignore next */
  public getFeatureNotes(includeArchive: boolean = false): Observable<FeatureNoteModel[]> {
    const params = Utilities.buildParamString({
      includeArchive,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIFeatureNote[]>>(`${apiUrls.featureNotes}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => FeatureNoteModel.deserializeList(response.Data)),
      tap((featureNotes: FeatureNoteModel[]) => (this.featureNotes = featureNotes))
    );
  }

  /* istanbul ignore next */
  public removeFeatureNote({ id }: FeatureNoteModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.delete<IAPIResponse<boolean>>(apiUrls.featureNoteById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => {
        return response.Data;
      }),
      tap(() => AlertStore.info('Feature Note deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public addFeatureNote(featureNote: FeatureNoteModel): Observable<FeatureNoteModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.post<IAPIResponse<IAPIFeatureNote>>(apiUrls.featureNotes, featureNote.serialize()).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIFeatureNote>) => FeatureNoteModel.deserialize(response.Data)),
      tap(() => AlertStore.info('Feature Note created successfully!'))
    );
  }

  /* istanbul ignore next */
  public updateFeatureNote(featureNote: FeatureNoteModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.put<IAPIResponse<boolean>>(apiUrls.featureNotes, featureNote.serialize()).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response.Data),
      tap(() => AlertStore.info('Feature Note updated successfully!'))
    );
  }

  /* istanbul ignore next */
  public loadFeatureNoteById(id: string): Observable<FeatureNoteModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIFeatureNote>>(apiUrls.featureNoteById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIFeatureNote>) => FeatureNoteModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public uploadBlob(id: string, file: File): Observable<FeatureNoteModel> {
    const data: FormData = new FormData();
    data.append('file', file);
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: { ...headers, HasFile: true } });
    return http.post<IAPIResponse<IAPIFeatureNote>>(`${apiUrls.featureNoteById(id)}/blob`, data).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIFeatureNote>) => FeatureNoteModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public removeBlob(id: string, blobUrl: string) {
    const params = Utilities.buildParamString({
      path: blobUrl,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.featureNoteById(id)}/blob?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => {
        return response.Data;
      })
    );
  }
}
