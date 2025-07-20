import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { ApprovalModel } from '../Modules/Shared/Models/Approvals.model';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { ApprovalDataModel } from '../Modules/Shared/Models/ApprovalData.model';

export class ApprovalsStore {
  @observable public approvalData: ApprovalModel[] = [];
  @observable public pageNumber: number = 1;
  @observable public userCommentTextField: boolean = true;
  @observable public vendorVendorLocationData:any = null;

  @action
  public setVendorLocationData(approvalResponseData) {
    this.vendorVendorLocationData = approvalResponseData;
  }

  @action
  public getApprovals(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<ApprovalModel>> {
    const http: HttpClient = new HttpClient({
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'ApprovalData',
      ...pageRequest,
    });
    return http
      .get<IAPIPageResponse<IAPIVMSComparison>>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.approvalData.getAllWithEntityGroup}?${params}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.approvalData = ApprovalModel.deserializeList(response.results);
          return { ...response, results: this.approvalData };
        })
      );
  }

  public mergeApproval(payload: ApprovalDataModel): Observable<ApprovalDataModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<ApprovalDataModel> = http.post<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.approval.merge}`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Approval Data Merged successfully!')),
      map(response => ApprovalDataModel.deserialize(response))
    );
  }
  public rejectApproval(payload: ApprovalDataModel): Observable<ApprovalDataModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<ApprovalDataModel> = http.post<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.approval.reject}`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Approval Data Rejected successfully!')),
      map(response => ApprovalDataModel.deserialize(response))
    );
  }

  public approvelGetInfo(rowIndex?: number): Observable<ApprovalDataModel> {
    const http: HttpClient = new HttpClient({
      headers: vendorManagementHeaders,
    });
    const request={
      approvalDataId:rowIndex
    };
    const upsertRequest: Observable<ApprovalDataModel> = http.post<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.approval.getInfo}?approvalDataId=${rowIndex}`,request
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(),
      map(
        response => ApprovalDataModel.deserialize(response)
      )
    );
  }
}
