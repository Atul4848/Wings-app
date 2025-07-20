import { baseApiPath, BaseStore, HttpClient, IAPIResponse } from '@wings/shared';
import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CategoryModel } from '../Models';
import { IAPICategory } from '../Interfaces';
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

export class CategoryStore extends BaseStore {
  @observable public categories: CategoryModel[] = [];

  /* istanbul ignore next */
  public getCategories(): Observable<CategoryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    return http.get<IAPIResponse<IAPICategory>>(apiUrls.category).pipe(
      Logger.observableCatchError,
      map(response => Utilities.customArraySort(CategoryModel.deserializeList(response.Data), 'name')),
      tap((categories: CategoryModel[]) => (this.categories = categories))
    );
  }

  /* istanbul ignore next */
  public upsertCategory(category: CategoryModel): Observable<CategoryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });
    const isNewRequest: boolean = category.id === 0;
    const upsertRequest: Observable<IAPIResponse<IAPICategory>> = isNewRequest
      ? http.post<IAPIResponse<IAPICategory>>(apiUrls.category, category.serialize())
      : http.put<IAPIResponse<IAPICategory>>(apiUrls.category, category.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<IAPICategory>) => {
        if (response.Data) {
          if (isNewRequest) {
            AlertStore.info('Category created successfully!');
            return;
          }
          AlertStore.info(`Category updated successfully!. 
              Total references updated:- 
              EventTypes: ${response.Data.UpdatedEventTypesCount || 0},
              Subscriptions: ${response.Data.UpdatedSubscriptionsCount || 0}`)
        }
      }),
      map((response: IAPIResponse<IAPICategory>) => CategoryModel.deserialize(response.Data)),
    );
  }

  /* istanbul ignore next */
  public removeCategory({ id }: CategoryModel): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.events, headers: headers });

    return http.delete<IAPIResponse<boolean>>(apiUrls.categoryById(id)).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<boolean>) => {
        !response.Data
          ? this.showAlertCritical('Failed to delete category.', 'category')
          : AlertStore.info('Category deleted successfully!');
      }),
      map((response: IAPIResponse<boolean>) => response.Data)
    );
  }
}
