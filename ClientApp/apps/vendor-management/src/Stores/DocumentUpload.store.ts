import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { COLLECTION_NAMES } from '../Modules/Shared/Enums/CollectionName.enum';
import { DocumentUploadModel } from '../Modules/Shared/Models/DocumentUpload.model';
import { IAPIDocumentFile } from '../Modules/Shared/Interfaces/Request/API-Request-DocumentUpload.interface';

export class DocumentUploadStore {
  @observable public documentList: DocumentUploadModel[] = [];
  @observable public documentUri: null = null;
  @observable public isOtherName: boolean = true;
  @observable public file: File | null = null;
  @observable public index: number;
  @observable public documentUpdated: boolean = false;

  @action
  public getDocumentUpload(
    collectionName: COLLECTION_NAMES,
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<DocumentUploadModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: collectionName,
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`/${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        const results = this.getDeserializeList(response.results, collectionName);
        return { ...response, results: results };
      })
    );
  }

  @action
  public importDocumentFile(collectionName: COLLECTION_NAMES, file: File, id: string): Observable<IAPIDocumentFile> {
    const data: FormData = new FormData();
    data.append(collectionName === COLLECTION_NAMES.VENDOR_DOCUMENT ? 'vendorId' : 'vendorLocationId', id);
    data.append('document', file);
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http
      .post<IAPIDocumentFile>(
        collectionName === COLLECTION_NAMES.VENDOR_DOCUMENT
          ? `${apiUrls.vendorDocument}/upload`
          : `${apiUrls.vendorLocationDocument}/upload`,
        data
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: response })),
        tapWithAction(response => (this.documentUri = response))
      );
  }

  @action
  public upsertDocument(
    collectionName: COLLECTION_NAMES,
    payload: DocumentUploadModel
  ): Observable<DocumentUploadModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<DocumentUploadModel> = isNewRequest
      ? http.post<any>(
        `${baseApiPath.vendorManagementCoreUrl}/${
          collectionName === COLLECTION_NAMES.VENDOR_DOCUMENT
            ? apiUrls.vendorDocument
            : apiUrls.vendorLocationDocument
        }`,
        payload
      )
      : http.put<any>(
        `${baseApiPath.vendorManagementCoreUrl}/${
          collectionName === COLLECTION_NAMES.VENDOR_DOCUMENT
            ? apiUrls.vendorDocument
            : apiUrls.vendorLocationDocument
        }/${payload.id}`,
        payload
      );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Document data saved successfully!')),
      map(response => DocumentUploadModel.deserialize(response))
    );
  }

  @action
  public downloadDocumentFile(
    collectionName: COLLECTION_NAMES,
    documentUri: string,
    documentId: number,
    id: number
  ): Observable<IAPIDocumentFile> {
    const data = {
      [collectionName === COLLECTION_NAMES.VENDOR_DOCUMENT ? 'vendorId' : 'vendorLocationId']: id,
      documentUri,
      documentId,
    };
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http
      .post<IAPIDocumentFile>(
        collectionName === COLLECTION_NAMES.VENDOR_DOCUMENT
          ? `${apiUrls.vendorDocument}/download`
          : `${apiUrls.vendorLocationDocument}/download`,
        data
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: response.results }))
      );
  }

  @action
  public removeDocument(documentId: number, collectionName: COLLECTION_NAMES,): Observable<string> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    return http.delete<any>(
      collectionName === COLLECTION_NAMES.VENDOR_DOCUMENT
        ?
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorDocument}?documentId=${documentId}`
        :
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationDocument}?documentId=${documentId}
      `).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Vendor document deleted successfully!'))
    );
  }

  public getDeserializeList(results: any[], collectionName?: COLLECTION_NAMES): any {
    switch (collectionName) {
      case COLLECTION_NAMES.VENDOR_LOCATION_DOCUMENT:
        this.documentList = DocumentUploadModel.deserializeList(results);
        return this.documentList;
      case COLLECTION_NAMES.VENDOR_DOCUMENT:
        this.documentList = DocumentUploadModel.deserializeList(results);
        return this.documentList;
    }
  }
}
