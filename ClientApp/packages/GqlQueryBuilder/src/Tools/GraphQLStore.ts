import { Utilities } from '@wings-shared/core';
import {
  EnvironmentVarsStore,
  ENVIRONMENT_VARS,
} from '@wings-shared/env-store';
import { AuthStore } from '@wings-shared/security';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { camelCase } from 'change-case';
import { action } from 'mobx';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { INoSqlAPIRequest } from '../Interfaces';
import {
  getArgsByPropertyName,
  getGqlQuery,
  listOfAllQueries,
} from './Queries';

class GraphQLStore {
  private readonly env = new EnvironmentVarsStore();

  private getHttpClient() {
    const baseurl = this.env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API);
    const httpClient = axios.create({
      baseURL: `${baseurl}/nosqlreferencedata`,
    } as any);
    httpClient.interceptors.request.use(
      config => {
        if (AuthStore.isAuthenticated && !config.headers.Authorization) {
          config.headers.Authorization = `bearer ${AuthStore.user?.accessToken}`;
          config.headers['Ocp-Apim-Subscription-Key'] = this.env.getVar(
            ENVIRONMENT_VARS.OCP_APIM_SUBSCRIPTION_KEY
          );
        }
        return config;
      },
      error => Promise.reject(error)
    );
    return httpClient;
  }

  /* istanbul ignore next */
  @action
  public loadCollectionData(request: INoSqlAPIRequest): Observable<any> {
    const httpClient = this.getHttpClient();
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    return from(httpClient.get<any>(`/api/ReferenceData/query?${params}`)).pipe(
      map(resp => resp.data)
    );
  }

  /* istanbul ignore next */
  @action
  public loadGqlData(request: INoSqlAPIRequest): Observable<any> {
    const httpClient = this.getHttpClient();
    return from(
      httpClient.post<any>('/graphql', { query: getGqlQuery(request) })
    ).pipe(
      map(resp => {
        const collection = resp.data?.data[camelCase(request.collectionName)];
        return {
          pageNumber: request.pageNumber,
          pageSize: request.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: collection?.items || [],
        };
      })
    );
  }

  /* istanbul ignore next */
  @action
  public loadArgsByPropertyName(inputPropertyName: string): Observable<any> {
    const httpClient = this.getHttpClient();
    return from(
      httpClient.post<any>('/graphql', {
        query: getArgsByPropertyName(inputPropertyName),
      })
    );
  }

  /* istanbul ignore next */
  @action
  public loadQueryList(): Observable<any> {
    const httpClient = this.getHttpClient();
    return from(
      httpClient.post<any>('/graphql', { query: listOfAllQueries })
    );
  }

  /* istanbul ignore next */
  @action
  public loadUserQueries(userEmail: string): Observable<any> {
    if (!userEmail) {
      return of([]);
    }
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      version: 'v1',
      collectionName: 'AdvanceSearchTemplate',
      filterCollection: JSON.stringify([
        Utilities.getFilter('UserId', userEmail),
      ]),
    });
    const httpClient = this.getHttpClient();
    return from(httpClient.get(`/api/ReferenceData?${params}`));
  }

  /* istanbul ignore next */
  @action
  public saveUserQueryData(queryData): Observable<any> {
    const httpClient = this.getHttpClient();
    return from(httpClient.put(`api/AdvanceSearchTemplate`, queryData)).pipe(
      catchError(err => {
        const message = Object.values(err.response.data.errors);
        AlertStore.critical(message[0] as string);
        return throwError(err);
      }),
      tap(() => AlertStore.info('Query report saved successfully!'))
    );
  }

  @action
  public deleteUserQueryData(queryId): Observable<any> {
    const httpClient = this.getHttpClient();
    return from(httpClient.delete(`api/AdvanceSearchTemplate/${queryId}`)).pipe(
      catchError(err => {
        const message = Object.values(err.response.data.errors);
        AlertStore.critical(message[0] as string);
        return throwError(err);
      }),
      tap(() => AlertStore.info('Query report deleted successfully!'))
    );
  }
}

const graphQLStore = new GraphQLStore();
export default graphQLStore;
