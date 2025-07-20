import { action, observable } from 'mobx';
import { VendorLocationPhotosModel } from '../Modules/Shared/Models/VendorLocationPhotos.model';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities } from '@wings-shared/core';
import { Observable } from 'rxjs';
import { HttpClient, baseApiPath } from '@wings/shared';
import { BaseStore, vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { IAPIVMSVendorComparison } from '../Modules/Shared/Interfaces';
import { Logger } from '@wings-shared/security';
import { map, tap } from 'rxjs/operators';
import {
  IAPIDocumentFile,
  IAPIPhotoFile,
} from '../Modules/Shared/Interfaces/Request/API-Request-DocumentUpload.interface';

export class VendorLocationPhotoStore {
  @observable public vendorLocationPhotos: VendorLocationPhotosModel[] = [];
  @observable public file: File | null = null;
  @observable public photoUri: null = null;

  @action
  public getVendorLocationPhotos(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<VendorLocationPhotosModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorLocation',
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIVMSVendorComparison>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        if (response.results.length > 0) {
          this.vendorLocationPhotos = VendorLocationPhotosModel.deserializeList(
            response.results[0]?.vendorLocationPhoto
          ).filter(item => item.status.id === 1);
          return { ...response, results: this.vendorLocationPhotos };
        }
      })
    );
  }

  @action
  public downloadVendorLocationPhoto(id: number, photoUri: string, photoId: number): Observable<IAPIPhotoFile> {
    const data = {
      vendorLocationId: id,
      photoUri,
      photoId,
    };
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<IAPIPhotoFile>(`${apiUrls.vendorLocationPhoto}/download`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response.results }))
    );
  }

  @action
  public deleteLocationPhoto(payload: VendorLocationPhotosModel): Observable<VendorLocationPhotosModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<VendorLocationPhotosModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationPhoto}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationPhoto}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => BaseStore.showAlert('Photo deleted successfully!', 0)),
      map(response => VendorLocationPhotosModel.deserialize(response))
    );
  }

  @action
  public upsertLocationPhoto(payload: VendorLocationPhotosModel[]): Observable<VendorLocationPhotosModel[]> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<VendorLocationPhotosModel[]> = http.post<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationPhoto}/add-photos`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => BaseStore.showAlert('Photos uploaded successfully!', 0)),
      map(response => VendorLocationPhotosModel.deserializeList(response))
    );
  }

  @action
  public uploadPhotos(file: File, id: string): Observable<IAPIDocumentFile> {
    const data: FormData = new FormData();
    data.append('vendorLocationId', id);
    data.append('photos', file);
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<IAPIDocumentFile>(`${apiUrls.vendorLocationPhoto}/upload`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response })),
      tapWithAction(response => (this.photoUri = response))
    );
  }
}
