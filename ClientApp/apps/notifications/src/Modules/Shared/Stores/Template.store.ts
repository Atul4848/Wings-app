import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TemplateModel, TemplatePreviewModel, RootTemplateModel } from '../Models';
import { IAPITemplate, IAPITemplateResponse, IAPIRootTemplate } from '../Interfaces';
import { apiUrls } from './API.url';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { TEMPLATE_TYPE } from '../Enums';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class TemplateStore extends BaseStore {
  @observable public templates: TemplateModel[] = [];

  /* istanbul ignore next */
  public getTemplates(): Observable<TemplateModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPITemplateResponse>(apiUrls.template).pipe(
      Logger.observableCatchError,
      map(response => TemplateModel.deserializeList(response.Data)),
      tap((templates: TemplateModel[]) => (this.templates = templates))
    );
  }

  /* istanbul ignore next */
  public upsertTemplate(template: TemplateModel): Observable<TemplateModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = template.id === 0;
    const upsertRequest: Observable<IAPIResponse<IAPITemplate>> = isNewRequest
      ? http.post<IAPIResponse<IAPITemplate>>(apiUrls.template, template.serialize())
      : http.put<IAPIResponse<IAPITemplate>>(apiUrls.template, template.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPITemplate>) => TemplateModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Template ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public removeTemplate({ id }: TemplateModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });

    return http.delete<IAPIResponse<boolean>>(apiUrls.templateById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response.Data),
      tap(() => AlertStore.info('Template deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public loadTemplateById(id: number): Observable<TemplateModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPITemplate>>(apiUrls.templateById(id)).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPITemplate>) => TemplateModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public sendTemplatePreview(templatePreview: TemplatePreviewModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.post<IAPIResponse<boolean>>(apiUrls.sendTemplatePreview, templatePreview).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<boolean>) => response.Data)
    );
  }

  /* istanbul ignore next */
  public getRootTemplate(templateType: TEMPLATE_TYPE): Observable<RootTemplateModel> {
    const params = Utilities.buildParamString({
      id: 1,
      templateType,
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPIRootTemplate>>(`${apiUrls.rootTemplate}?${params}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIRootTemplate>) => RootTemplateModel.deserialize(response.Data))
    );
  }

  /* istanbul ignore next */
  public updateRootTemplate(request: IAPIRootTemplate): Observable<RootTemplateModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.put<IAPIResponse<RootTemplateModel>>(apiUrls.rootTemplate, request).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<RootTemplateModel>) => response.Data)
    );
  }
}
