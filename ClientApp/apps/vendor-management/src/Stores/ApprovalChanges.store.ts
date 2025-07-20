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
import { ApprovalDataModel } from '../Modules/Shared/Models/ApprovalData.model';
import { ApprovalChangesDataModel } from '../Modules/Shared/Models/ApprovalChanges.model';
import { AlertStore } from '@uvgo-shared/alert';

export class ApprovalChangesStore {
  @observable public approvalData: ApprovalChangesDataModel[] = [];
  @observable public pageNumber: number = 1;
  @observable public userCommentTextField: boolean = true;

  @action
  public getServiceItemPricingApprovalData(
    vendorLocationId, pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<ApprovalChangesDataModel>> {
    const http: HttpClient = new HttpClient({
      headers: vendorManagementHeaders,
    });
    return http
      .get<IAPIPageResponse<IAPIVMSComparison>>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricingApproval}/?vendorLocationId=${vendorLocationId}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.approvalData = ApprovalChangesDataModel.deserializeList(response);
          this.approvalData = this.approvalData.filter(item => {
            const statusId = item.approvalStatus.id;
            return statusId === 1 || statusId === 3;
          })
          return { ...response, results: this.approvalData };
        })
      );
  }
  public approveChanges(payload: ApprovalChangesDataModel): Observable<ApprovalChangesDataModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<ApprovalChangesDataModel> = http.put<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricingApproved}?Id=${payload.id}`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Approval Changes successfully!')),
      map(response => ApprovalChangesDataModel.deserialize(response))
    );
  }

  public rejectChanges(payload: ApprovalChangesDataModel): Observable<ApprovalChangesDataModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<ApprovalChangesDataModel> = http.put<any>(
      `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.serviceItemPricingApproved}?Id=${payload.id}`,
      payload
    );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Approval Data Rejected successfully!')),
      map(response => ApprovalChangesDataModel.deserialize(response))
    );
  }

}
