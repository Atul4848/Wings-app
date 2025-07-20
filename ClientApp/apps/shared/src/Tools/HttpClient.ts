import axios, { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import { Observable } from 'rxjs';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { AuthStore } from '@wings-shared/security';

function addBody<T>(
  options: {
    observe?: HttpObserve;
    params?: any;
    responseType?: ResponseType;
  },
  body: T | null
): any {
  return {
    body,
    observe: options.observe,
    params: options.params,
    responseType: options.responseType,
  };
}

export type HttpObserve = 'body' | 'response';

type Body = object | string | number;

/**
 * Basically two options of return type:
 * const httpClient = new HttpClient(params);
 * httpClient.post<Type>(url, data, { observe: 'response' }) => return Observable<AxiosResponse<Type>>
 * where data wrapped in response.data object,
 *
 * Basic usage still the same:
 * const httpClient = new HttpClient(params);
 * httpClient.post<Type>(url, data) => return Observable<Type>
 *
 * We can add more response Interfaces based on response Type later.
 */
/* istanbul ignore next */
export default class HttpClient {
  private env = new EnvironmentVarsStore();
  private httpClient: AxiosInstance;
  private ocpApimSubscriptionKey: string = this.env.getVar(ENVIRONMENT_VARS.OCP_APIM_SUBSCRIPTION_KEY);

  constructor(params?: AxiosRequestConfig) {
    this.httpClient = axios.create({
      ...params,
    });

    this.httpClient.interceptors.request.use(
      config => {
        if (AuthStore.isAuthenticated && !config.headers.Authorization) {
          config.headers.Authorization = `bearer ${AuthStore.user?.accessToken}`;
          const hasOcpApimKey: string = config.headers['Ocp-Apim-Subscription-Key'];
          if (!hasOcpApimKey) {
            config.headers['Ocp-Apim-Subscription-Key'] = this.ocpApimSubscriptionKey;
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(this.successHandler.bind(this), this.errorHandler.bind(this));
  }

  private getResponseObject<T>(response: AxiosResponse, observeType?: HttpObserve): T;

  private getResponseObject<T>(response: AxiosResponse, observeType: 'response'): AxiosResponse<T>;

  private getResponseObject<T>(response: AxiosResponse, observeType: HttpObserve): any {
    switch (observeType) {
      case 'response':
        return { ...response };
      default:
        return response.data;
    }
  }

  private makeRequest<T>(
    method: string,
    url: string,
    options: {
      body?: any;
      observe: 'response';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<AxiosResponse<T>>;

  private makeRequest<T>(
    method: string,
    url: string,
    options?: {
      body?: any;
      observe?: 'body';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<T>;

  private makeRequest(
    method: string,
    url: string,
    options: {
      body?: any;
      observe?: HttpObserve;
      params?: any;
      responseType?: ResponseType;
    } = {}
  ): Observable<any> {
    let request: AxiosPromise;
    const { body, observe, params, responseType } = options;

    switch (method) {
      case 'GET':
        request = this.httpClient.get<any>(url, { params, responseType });
        break;
      case 'POST':
        request = this.httpClient.post<any>(url, body, { params, responseType });
        break;
      case 'PUT':
        request = this.httpClient.put<any>(url, body, { params, responseType });
        break;
      case 'PATCH':
        request = this.httpClient.patch<any>(url, body, { params, responseType });
        break;
      case 'DELETE':
        request = this.httpClient.delete<any>(url, { params, responseType, data: body });
        break;

      default:
        throw new Error('Method not supported');
    }
    return new Observable<any>(subscriber => {
      request
        .then((response: AxiosResponse) => {
          const data = this.getResponseObject(response, observe);

          subscriber.next(data);
          subscriber.complete();
        })
        .catch((err: AxiosError) => {
          subscriber.error(err);
          subscriber.complete();
        });
    });
  }

  public get<T>(
    url: string,
    options: {
      observe: 'response';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<AxiosResponse<T>>;

  public get<T>(
    url: string,
    options?: {
      observe: 'body';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<T>;

  public get(
    url: string,
    options: {
      observe?: HttpObserve;
      params?: any;
      responseType?: ResponseType;
    } = {}
  ): Observable<any> {
    return this.makeRequest('GET', url, options as any);
  }

  public post<T>(
    url: string,
    body: Body,
    queryParams: {
      observe: 'response';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<AxiosResponse<T>>;

  public post<T>(
    url: string,
    body: Body,
    options?: {
      observe?: 'body';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<T>;

  public post(
    url: string,
    body: Body,
    options: {
      observe?: HttpObserve;
      params?: any;
      responseType?: ResponseType;
    } = {}
  ): Observable<any> {
    return this.makeRequest('POST', url, addBody(options, body));
  }

  public put<T>(
    url: string,
    body: Body,
    queryParams: {
      observe: 'response';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<AxiosResponse<T>>;

  public put<T>(
    url: string,
    body: Body,
    options?: {
      observe?: 'body';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<T>;

  public put(
    url: string,
    body: Body,
    options: {
      observe?: HttpObserve;
      params?: any;
      responseType?: ResponseType;
    } = {}
  ): Observable<any> {
    return this.makeRequest('PUT', url, addBody(options, body));
  }

  public patch<T>(
    url: string,
    body: Body,
    queryParams: {
      observe: 'response';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<AxiosResponse<T>>;

  public patch<T>(
    url: string,
    body: Body,
    options?: {
      observe?: 'body';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<T>;

  public patch(
    url: string,
    body: Body,
    options: {
      observe?: HttpObserve;
      params?: any;
      responseType?: ResponseType;
    } = {}
  ): Observable<any> {
    return this.makeRequest('PATCH', url, addBody(options, body));
  }

  public delete<T>(
    url: string,
    body: Body,
    options: {
      observe: 'response';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<AxiosResponse<T>>;

  public delete<T>(
    url: string,
    body?: Body,
    options?: {
      observe: 'body';
      params?: any;
      responseType?: ResponseType;
    }
  ): Observable<T>;

  public delete(
    url: string,
    body: Body,
    options: {
      observe?: HttpObserve;
      params?: any;
      responseType?: ResponseType;
    } = {}
  ): Observable<any> {
    return this.makeRequest('DELETE', url, addBody(options, body));
  }

  private successHandler(response) {
    return response;
  }

  private async errorHandler(error: AxiosError): Promise<AxiosError<any>> {
    if (!error.isAxiosError) {
      return error;
    }

    const { status, data } = error.response;

    if (status === 401) {
      return AuthStore.logout()
        .toPromise()
        .then(() => Promise.reject(error));
    }

    const isJsonBlob = data instanceof Blob && data.type == 'application/json';
    // handle error for blob type requests only
    if (isJsonBlob) {
      const responseData = await data?.text();
      const responseJson = typeof responseData == 'string' ? JSON.parse(responseData) : responseData;
      error.message = this.getApiErrorMessage(status, responseJson);
      return Promise.reject(error);
    }

    error.message = this.getApiErrorMessage(status, data);
    return Promise.reject(error);
  }

  // Catch error responses.
  // In error responses we have only Client errors (400–499) and Server errors (500–599)
  private getApiErrorMessage(status: number, data: any): string {
    const apiErrorMessage = data?.Errors?.map(error => error.Message)?.join(', ');
    switch (true) {
      case status === 400:
        return data?.title || apiErrorMessage || data?.messages?.join(', ');
      case status >= 403 && status <= 500:
        return data?.message || data?.messages?.join(', ') || apiErrorMessage;
      default:
        return 'Error Occurred.';
    }
  }
}
