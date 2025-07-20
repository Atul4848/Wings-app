import {
  baseApiPath,
  BaseStore,
  HttpClient,
} from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import {
  IAPIUVGOBannerResponse,
  IAPIUpsertUVGOBannerRequest,
  IAPIUVGOBannerTypeResponse,
  IAPIUVGOBannerServicesResponse,
} from '../Interfaces';
import { UVGOBannerModel, UVGOBannerTypeModel, UVGOBannerServicesModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';

export class UVGOBannerStore extends BaseStore {
  /* istanbul ignore next */
  public uvgoBanners(request?: IAPIGridRequest): Observable<IAPIPageResponse<UVGOBannerModel>> {
    const params = Utilities.buildParamString({
      page: request?.pageNumber || 1,
      size: request?.pageSize || 10,
      searchBy: request?.searchCollection || '',
    });
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIPageResponse<IAPIUVGOBannerResponse>>(`${apiUrls.uvgoBanners}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return {
          totalNumberOfRecords: response.meta.total,
          pageNumber: response.meta.page,
          pageSize: response?.meta.size,
          results: UVGOBannerModel.deserializeList(response.results),
        };
      })
    );
  }

  /* istanbul ignore next */
  public upsertUVGOBanner(request: IAPIUpsertUVGOBannerRequest): Observable<UVGOBannerModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const isNewRequest: boolean = !Boolean(request.Id);
    const upsertRequest: Observable<IAPIResponse<IAPIUVGOBannerResponse>> = isNewRequest
      ? http.post<IAPIResponse<IAPIUVGOBannerResponse>>(apiUrls.uvgoBanners, request)
      : http.put<IAPIResponse<IAPIUVGOBannerResponse>>(apiUrls.uvgoBanners, request);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUVGOBannerResponse>) => UVGOBannerModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`uvGO Banner ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteUVGOBanner(Id: string): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete(`${apiUrls.uvgoBanners}?id=${Id}`).pipe(
      Logger.observableCatchError,
      map(response => response.results)
    );
  }

  /* istanbul ignore next */
  public uvgoBannerType(): Observable<UVGOBannerTypeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIUVGOBannerTypeResponse[]>>(apiUrls.uvgoBannerType).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUVGOBannerTypeResponse[]>) =>
        Utilities.customArraySort<UVGOBannerTypeModel>(
          UVGOBannerTypeModel.deserializeList(response.Data),
          'notificationTypeId'
        )
      )
    );
  }

  /* istanbul ignore next */
  public upsertUVGOBannerType(request: UVGOBannerTypeModel): Observable<UVGOBannerTypeModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const isNewRequest: boolean = !Boolean(request.id);
    const upsertRequest: Observable<IAPIResponse<IAPIUVGOBannerTypeResponse>> = isNewRequest
      ? http.post<IAPIResponse<IAPIUVGOBannerTypeResponse>>(apiUrls.uvgoBannerType, request.serialize())
      : http.put<IAPIResponse<IAPIUVGOBannerTypeResponse>>(apiUrls.uvgoBannerType, request.serialize());
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUVGOBannerTypeResponse>) => UVGOBannerTypeModel.deserialize(response.Data)),
      tap(() => AlertStore.info(`Banner Type ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteUVGOBannerType(Id: number): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.uvgoBannerType}?id=${Id}`).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<boolean>) => {
        if (response.Data) {
          AlertStore.info('Banner type deleted successfully!');
          return;
        }
        AlertStore.info('Failed to delete banner type.');
      }),
      map((response: IAPIResponse<boolean>) => response.Data)
    );
  }

  /* istanbul ignore next */
  public uvgoBannerServices(): Observable<UVGOBannerServicesModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIUVGOBannerServicesResponse[]>>(apiUrls.uvgoBannerServices).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUVGOBannerServicesResponse[]>) =>
        Utilities.customArraySort<UVGOBannerServicesModel>(
          UVGOBannerServicesModel.deserializeList(response.Data),
          'notificationServiceId'
        )
      )
    );
  }

  /* istanbul ignore next */
  public upsertUVGOBannerServices(request: UVGOBannerServicesModel): Observable<UVGOBannerServicesModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    const isNewRequest: boolean = !Boolean(request.id);
    const upsertRequest: Observable<IAPIResponse<IAPIUVGOBannerServicesResponse>> = isNewRequest
      ? http.post<IAPIResponse<IAPIUVGOBannerServicesResponse>>(apiUrls.uvgoBannerServices, request.serialize())
      : http.put<IAPIResponse<IAPIUVGOBannerServicesResponse>>(apiUrls.uvgoBannerServices, request.serialize());
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIUVGOBannerServicesResponse>) =>
        UVGOBannerServicesModel.deserialize(response.Data)
      ),
      tap(() => AlertStore.info(`Banner Services ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public deleteUVGOBannerServices(Id: number): Observable<boolean> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.delete<IAPIResponse<boolean>>(`${apiUrls.uvgoBannerServices}?id=${Id}`).pipe(
      Logger.observableCatchError,
      tap((response: IAPIResponse<boolean>) => {
        if (response.Data) {
          AlertStore.info('Banner service deleted successfully!');
          return;
        }
        AlertStore.info('Failed to delete banner service.');
      }),
      map((response: IAPIResponse<boolean>) => response.Data)
    );
  }
}
