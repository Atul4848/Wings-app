import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { ContactMasterModel } from '../Modules/Shared/Models/ContactMaster.model';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { VendorContact } from '../Modules/Shared/Models/VendorContact.model';
import { ServiceCommunicationPreferenceModel } from '../Modules/Shared/Models/ServiceCommunicationPreference.model';
import { COLLECTION_NAMES } from '../Modules/Shared/Enums/CollectionName.enum';
import { VendorLocationContactModel } from '../Modules/Shared/Models/VendorLocationContact.model';
import { DirectoryCodeModel } from '../Modules/Shared';

export class DirectoryCodeStore {
  @observable public directoryCodeList: DirectoryCodeModel[] = [];
  @observable public isContactValid: boolean = false;

  @action
  public getDirectoryCodeGridData(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<DirectoryCodeModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`/${apiUrls.directoryCode}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.directoryCodeList = DirectoryCodeModel.deserializeList(response.results);
        return { ...response, results: this.directoryCodeList };
      })
    );
  }

  @action
  public upsertDirectoryCode(payload: DirectoryCodeModel): Observable<DirectoryCodeModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<DirectoryCodeModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.directoryCode}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.directoryCode}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => DirectoryCodeModel.deserialize(response)),
      tap(() => AlertStore.info('Directory Code data saved successfully!'))
    );
  }

  public removeDirectoryCode(directoryCodeId: number): Observable<string> {
    const payload = {
      userId: 'string',
      directoryCodeId: directoryCodeId,
    };
    const http = new HttpClient({ headers: vendorManagementHeaders });
    return http.delete<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.directoryCode}`, payload).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Directory Code data deleted successfully!'))
    );
  }

}
