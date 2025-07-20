import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Logger } from '@wings-shared/security';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';

import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities } from '@wings-shared/core';
import { LocationHoursModel, Slide1Model, Slide6Model } from '../Modules/Shared';
import { Slide2Model } from '../Modules/Shared/Models/Slide2.model';
import { IAPIDocumentFile } from '../Modules/Shared/Interfaces/Request/API-Request-DocumentUpload.interface';
import { Slide3Model } from '../Modules/Shared/Models/Slide3.model';
import { Slide4Model } from '../Modules/Shared/Models/Slide4.model';
import { IAPIVMSVendorComparison } from '../Modules/Shared/Interfaces';
import { Slide5Model } from '../Modules/Shared/Models/Slide5.model';
interface IGetSlide1Approval {
  vendorId: number;
  locationUniqueCode: string;
}
interface ISlide1Approval {
  userId: string;
  vendorId: number;
  tempLocationId: string;
}
interface ISlideRejection extends ISlide1Approval {
  remark: string;
}
export class SlidesApprovalStore {
  deserialize(response: Slide6Model) {
    throw new Error('Method not implemented.');
  }
  @observable public activeStep: number = 1;
  @observable public vendorId: number = 0;
  @observable public locationUniqueCode: string = '';
  @observable public tempLocationId: string = '';
  @observable public slide1ApprovalData: Slide1Model = null;
  @observable public slide8ApprovalData: Slide5Model = null;
  @observable public userCommentTextField: boolean = true;
  @observable public rejectionComment: string = '';
  @observable public slide2DocumentsList: Slide2Model[] = [];
  @observable public slide3Data: Slide3Model = null;
  @observable public slide4Data: Slide4Model = null;
  @observable public onboardingHoursList: LocationHoursModel[] = [];
  @observable public ICAOcode: boolean = false;

  @action
  public getSlide1Approval(payload?: IGetSlide1Approval): Observable<Slide1Model> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http
      .get<IAPIPageResponse<Slide1Model>>(
        `${apiUrls.vendorOnBoardSlideOneNTwo}/GetByVendorId?vendorId=${payload?.vendorId}&locationUniqueCode=${payload?.locationUniqueCode}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.slide1ApprovalData = Slide1Model.deserialize(response[0]);
          this.slide3Data = Slide3Model.deserialize(response[0]);
          return { ...response, results: this.slide1ApprovalData };
        })
      );
  }
  public getSlide8Approval(payload?: IGetSlide1Approval): Observable<Slide5Model> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http
      .get<IAPIPageResponse<Slide5Model>>(
        `${apiUrls.VendorOnBoardSlideEight}/GetByVendorId?vendorId=${payload?.vendorId}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.ICAOcode = response && response[0]?.coordinatingOffice ? true : false;
          this.slide8ApprovalData = Slide5Model.deserialize(response[0]);
          return { ...response, results: this.slide8ApprovalData };
        })
      );
  }
  public getSlide4Approval(payload?: IGetSlide1Approval): Observable<Slide1Model> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http
      .get<IAPIPageResponse<Slide1Model>>(
        `${apiUrls.vendorOnBoardSlideSeven}/GetByVendorId?vendorId=${payload?.vendorId}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.slide1ApprovalData = Slide1Model.deserialize(response[0]);
          this.slide3Data = Slide3Model.deserialize(response[0]);
          this.slide4Data = Slide4Model.deserialize(response[0]);
          return { ...response, results: this.slide4Data };
        })
      );
  }
  public approveSlide(payload: ISlide1Approval, slideNo: number): Observable<Slide1Model> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });

    return slideNo <= 3
      ? http
        .put<IAPIPageResponse<Slide1Model>>(`${apiUrls.vendorOnboardTracking}/Slide${slideNo}Approval`, payload)
        .pipe(
          Logger.observableCatchError,
          map(response => {
            this.slide1ApprovalData = Slide1Model.deserialize(response.results);
            return { ...response, results: this.slide1ApprovalData };
          })
        )
      : http
        .put<IAPIPageResponse<Slide3Model>>(
          `${apiUrls.vendorOnboardTracking}/Slide${slideNo}Approval?slideNo=slide${slideNo}`,
          payload
        )
        .pipe(
          Logger.observableCatchError,
          map(response => {
            this.slide1ApprovalData = Slide1Model.deserialize(response.results);
            return { ...response, results: this.slide1ApprovalData };
          })
        );
  }
  public approveSlide2(payload: ISlide1Approval): Observable<Slide1Model> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });

    return http
      .post<IAPIPageResponse<Slide1Model>>(`${apiUrls.vendorOnBoardSlideThreeDocument}/Approval`, payload)
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.slide1ApprovalData = Slide1Model.deserialize(response.results);
          return { ...response, results: this.slide1ApprovalData };
        })
      );
  }
  @action
  public getByVendorOnboardTracking(tempLocationId: string): Observable<IAPIPageResponse<[Slide1Model]>> {
    const http: HttpClient = new HttpClient({
      headers: vendorManagementHeaders,
    });
    return http
      .get<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOnboardTracking}/${tempLocationId}`)
      .pipe(
        Logger.observableCatchError,
        map(response => {
          return [ ...response ];
        })
      );
  }

  @action
  public getByVendorIdSlideNine(tempLocationId?: string): Observable<IAPIPageResponse<Slide6Model>> {
    const http: HttpClient = new HttpClient({ headers: vendorManagementHeaders });
    return http
      .get<any>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOnboardSlide9}/byTempLocationId?tempLocationId=${tempLocationId}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          return { ...response };
        })
      );
  }
  public slideNineApproval(payload?: ISlide1Approval): Observable<IAPIPageResponse<Slide6Model>> {
    const http: HttpClient = new HttpClient({ headers: vendorManagementHeaders });
    return http
      .post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOnboardSlide9}/Approval`, payload)
      .pipe(
        Logger.observableCatchError,
        map(response => {
          return { ...response };
        })
      );
  }

  public rejectSlides(payload: ISlideRejection, slideNo: number): Observable<Slide1Model> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });

    return http
      .put<IAPIPageResponse<Slide1Model>>(
        `${apiUrls.vendorOnboardTracking}/RejectSlideStatus?slideNo=${`Slide${slideNo}`}`,
        payload
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.slide1ApprovalData = Slide1Model.deserialize(response.results);
          return { ...response, results: this.slide1ApprovalData };
        }),
        tap(() => AlertStore.info('Rejected data with reason has been saved'))
      );
  }
  @action
  public getUploadedDocuments(tempLocationId: string): Observable<IAPIPageResponse<Slide2Model>> {
    const http: HttpClient = new HttpClient({
      headers: vendorManagementHeaders,
    });
    return http
      .get<any>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOnBoardSlideThreeDocument}/getbytemplocationid?tempLocationId=${tempLocationId}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({
          ...response,
          results: Slide2Model.deserializeList(response),
        })),
        tapWithAction(response => (this.slide2DocumentsList = response.results))
      );
  }

  @action
  public downloadDocumentFile(vendorId: number, documentUri: string): Observable<IAPIDocumentFile> {
    const data = {
      vendorId: vendorId,
      documentUri,
    };
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<IAPIDocumentFile>(`${apiUrls.vendorOnBoardSlideThreeDocument}/Download`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response.results }))
    );
  }

  @action
  public getOnBoardingHours(vendorId: number, tempLocationId: string): Observable<LocationHoursModel[]> {
    const http: HttpClient = new HttpClient({
      headers: vendorManagementHeaders,
    });
    return http
      .get<IAPIPageResponse<IAPIVMSVendorComparison>>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorOnboardHours}/${vendorId},${tempLocationId}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.onboardingHoursList = LocationHoursModel.deserializeList(response);
          return { ...response, results: this.onboardingHoursList };
        })
      );
  }
}
