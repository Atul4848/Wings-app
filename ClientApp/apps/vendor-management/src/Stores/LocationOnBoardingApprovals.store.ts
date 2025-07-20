import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Logger } from '@wings-shared/security';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';

import { LocationOnBoardingApprovalsModel } from '../Modules/Shared/Models/LocationOnBoardingApprovals.model';
import { IAPIGridRequest, IAPIPageResponse, Utilities } from '@wings-shared/core';

export class LocationOnBoardingApprovalStore {
  @observable public pageNumber: number = 1;
  @observable public locationOnBoardingApprovalModel: LocationOnBoardingApprovalsModel[] = [];

  @action
  public getLocationOnboardApprovalList(pageRequest?: IAPIGridRequest): Observable<IAPIVMSComparison> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorOnBoardSlideOneNTwo',
      ...pageRequest,
    });
    return http
      .get<IAPIPageResponse<LocationOnBoardingApprovalsModel[]>>(
        `${apiUrls.vendorOnBoardSlideOneNTwo}/GetAll?${params}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.locationOnBoardingApprovalModel = LocationOnBoardingApprovalsModel.deserializeList(response.results);
          return { ...response, results: this.locationOnBoardingApprovalModel };
        })
      );
  }

  @action
  public getByVendorOnboardTracking(
    tempLocationId: string
  ): Observable<IAPIPageResponse<[VendorOnBoardTrackingModel]>> {
    const http: HttpClient = new HttpClient({ headers: vendorManagementHeaders });
    return http
      .get<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOnboardTracking}/${tempLocationId}`)
      .pipe(
        Logger.observableCatchError,
        map(response => {
          return [ ...response ];
        })
      );
  }
}
