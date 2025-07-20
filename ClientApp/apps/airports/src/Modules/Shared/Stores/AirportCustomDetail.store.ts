import { HttpClient, baseApiPath, BaseAirportStore, NO_SQL_COLLECTIONS } from '@wings/shared';
import { apiUrls } from './ApiUrls';
import { Observable, throwError } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import {
  AirportCustomGeneralModel,
  CustomGeneralInfoReviewModel,
  CustomsContactModel,
  CustomsDetailInfoModel,
  CustomsNoteModel,
  IntlCustomsDetailsModel,
  UsCustomsDetailsModel,
} from '../Models';
import {
  IAPIAirportCustomGeneralRequest,
  IAPIAirportCustomsContact,
  IAPIAirportCustomsContactRequest,
  IAPICustomGeneralInfoReview,
  IAPICustomsNote,
  IAPIFaaMergeResponse,
  IAPIIntlCustomsDetails,
  IAPIUsCustomsDetailsRequest,
} from '../Interfaces';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, SettingsTypeModel, tapWithAction, Utilities } from '@wings-shared/core';
import { observable } from 'mobx';

export class AirportCustomDetailStore extends BaseAirportStore {
  @observable customsContactNoSql: SettingsTypeModel[] = [];
  /* istanbul ignore next */
  public getCustomsGeneralInfo(airportId: number): Observable<AirportCustomGeneralModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<AirportCustomGeneralModel>(`api/${airportId}/${apiUrls.customGeneralInfo}`).pipe(
      Logger.observableCatchError,
      map(response => AirportCustomGeneralModel.deserialize(response)),
      catchError(err => throwError(err))
    );
  }
  /* istanbul ignore next */
  public upsertGeneral(request: IAPIAirportCustomGeneralRequest): Observable<AirportCustomGeneralModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirportCustomGeneralRequest> = isNewRequest
      ? http.post<IAPIAirportCustomGeneralRequest>(`api/${request.airportId}/${apiUrls.customGeneralInfo}`, request)
      : http.put<IAPIAirportCustomGeneralRequest>(
        `api/${request.airportId}/${apiUrls.customGeneralInfo}/${request.id}`,
        request
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => AirportCustomGeneralModel.deserialize(response)),
      tap(() => AlertStore.info(`General Information ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getCustomsNonUsInfo(airportId: number): Observable<IntlCustomsDetailsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<IntlCustomsDetailsModel>(`api/airport/${airportId}/${apiUrls.intlCustomsInfo}`).pipe(
      Logger.observableCatchError,
      map(response => IntlCustomsDetailsModel.deserialize(response)),
      catchError(err => throwError(err))
    );
  }

  public upsertIntlCustomsInfo(request: IntlCustomsDetailsModel): Observable<IntlCustomsDetailsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIIntlCustomsDetails> = isNewRequest
      ? http.post<IAPIIntlCustomsDetails>(
        `api/airport/${request.airportId}/${apiUrls.intlCustomsInfo}`,
        request.serialize()
      )
      : http.put<IAPIIntlCustomsDetails>(
        `api/airport/${request.airportId}/${apiUrls.intlCustomsInfo}/${request.id}`,
        request.serialize()
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => IntlCustomsDetailsModel.deserialize(response)),
      tap(() => AlertStore.info(`Non US Customs Details ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getCustomsDetail(airportId: number): Observable<CustomsDetailInfoModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<CustomsDetailInfoModel>(`api/airport/${airportId}/${apiUrls.customsDetail}`).pipe(
      Logger.observableCatchError,
      map(response => CustomsDetailInfoModel.deserialize(response)),
      catchError(err => throwError(err))
    );
  }
  public getCustomsUsInfo(airportId: number): Observable<UsCustomsDetailsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.get<UsCustomsDetailsModel>(`api/airport/${airportId}/${apiUrls.usCustomsInfo}`).pipe(
      Logger.observableCatchError,
      map(response => UsCustomsDetailsModel.deserialize(response)),
      catchError(err => throwError(err))
    );
  }

  public upsertCustomsDetail(request: CustomsDetailInfoModel): Observable<CustomsDetailInfoModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIIntlCustomsDetails> = isNewRequest
      ? http.post<IAPIIntlCustomsDetails>(
        `api/airport/${request.airportId}/${apiUrls.customsDetail}`,
        request.serialize()
      )
      : http.put<IAPIIntlCustomsDetails>(
        `api/airport/${request.airportId}/${apiUrls.customsDetail}/${request.id}`,
        request.serialize()
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => CustomsDetailInfoModel.deserialize(response)),
      tap(() => AlertStore.info(`Customs Details ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  public upsertUsCustomsInfo(request: UsCustomsDetailsModel): Observable<UsCustomsDetailsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIUsCustomsDetailsRequest> = isNewRequest
      ? http.post<IAPIUsCustomsDetailsRequest>(
        `api/airport/${request.airportId}/${apiUrls.usCustomsInfo}`,
        request.serialize()
      )
      : http.put<IAPIUsCustomsDetailsRequest>(
        `api/airport/${request.airportId}/${apiUrls.usCustomsInfo}/${request.id}`,
        request.serialize()
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => UsCustomsDetailsModel.deserialize(response)),
      tap(() => AlertStore.info(`US Customs Details ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  public getCustomsNotes(customsDetailId?: number): Observable<IAPIPageResponse<CustomsNoteModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
    });
    return http.get<IAPIPageResponse<IAPICustomsNote>>(`${apiUrls.customsNote(customsDetailId)}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CustomsNoteModel.deserializeList(response.results) })),
      catchError(err => throwError(err))
    );
  }

  public upsertCustomsNote(request: CustomsNoteModel): Observable<CustomsNoteModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPICustomsNote> = isNewRequest
      ? http.post<IAPICustomsNote>(`${apiUrls.customsNote(request.customsDetailId)}`, request.serialize())
      : http.put<IAPICustomsNote>(`${apiUrls.customsNote(request.customsDetailId)}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => CustomsNoteModel.deserialize(response)),
      tap(() => AlertStore.info(`Customs Note ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  public getCustomsContacts(airportId?: number): Observable<IAPIPageResponse<CustomsContactModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      filterCollection: JSON.stringify([{ airportId }]),
    });
    return http.get<IAPIPageResponse<IAPIAirportCustomsContact>>(`${apiUrls.customsContact}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CustomsContactModel.deserializeList(response.results) })),
      catchError(err => throwError(err))
    );
  }

  public upsertCustomsContact(request: CustomsContactModel): Observable<CustomsContactModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAirportCustomsContactRequest> = isNewRequest
      ? http.post<IAPIAirportCustomsContactRequest>(`${apiUrls.customsContact}`, request.serialize())
      : http.put<IAPIAirportCustomsContactRequest>(`${apiUrls.customsContact}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map(response => CustomsContactModel.deserialize(response)),
      tap(() => AlertStore.info(`Customs Contacts ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getCustomsContactNoSql(searchValue: string): Observable<IAPIPageResponse<SettingsTypeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.CUSTOMS_CONTACT,
      pageSize: 100,
      searchCollection: JSON.stringify([ Utilities.getFilter('ContactValue', searchValue) ]),
    });

    return http.get<IAPIPageResponse<IAPIAirportCustomsContact>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      takeUntil(this.reset$),
      map(response => ({
        ...response,
        results: response.results.map(
          x =>
            new SettingsTypeModel({
              id: x.customsContactId,
              name: x.contactValue,
            })
        ),
      })),
      tapWithAction(response => (this.customsContactNoSql = response.results))
    );
  }

  public getCustomGeneralInfoReview(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<CustomGeneralInfoReviewModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPICustomGeneralInfoReview>>(`${apiUrls.customGeneralInfoStaging}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CustomGeneralInfoReviewModel.deserializeList(response.results) }))
    );
  }

  public getCustomGeneralInfoReviewList(rowIndex?: number): Observable<CustomGeneralInfoReviewModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http
      .get<IAPIPageResponse<IAPICustomGeneralInfoReview>>(`${apiUrls.customGeneralInfoStaging}/CustomGeneralInfoStagingPropertyList/${rowIndex}`)
      .pipe(
        Logger.observableCatchError,
        map(response => CustomGeneralInfoReviewModel.deserialize(response))
      );
  }

  /* istanbul ignore next */
  public approveCustomGeneralInfoStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(`${apiUrls.customGeneralInfoStaging}/Approve/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Approved successfully!');
      })
    );
  }

  /* istanbul ignore next */
  public rejectCustomGeneralInfoStaging(request): Observable<IAPIFaaMergeResponse> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    return http.put<string[]>(`${apiUrls.customGeneralInfoStaging}/Reject/${request.uplinkStagingId}`, request).pipe(
      Logger.observableCatchError,
      tap(resp => {
        resp.hasErrors
          ? AlertStore.critical(resp.errors?.map(x => x.errorMessage).join(', '))
          : AlertStore.info('Records Rejected successfully!');
      })
    );
  }
}
