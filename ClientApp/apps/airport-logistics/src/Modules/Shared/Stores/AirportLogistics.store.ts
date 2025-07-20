import { SURVEY_STATUS } from './../Enums/SurveyStatus.enum';
import { action, observable, computed } from 'mobx';
import { Observable } from 'rxjs';
import { HttpClient, BaseStore } from '@wings/shared';
import { AuthStore, Logger } from '@wings-shared/security';
import { url } from './ApiEndpoints';
import { switchMap, tap, map } from 'rxjs/operators';
import {
  SurveyModel,
  SurveyListModel,
  SurveyDetailModel,
  CiqModel,
  ArrivalLogisticsModel,
  DepartureLogisticsModel,
  AirportEventsModel,
  LogisticsComponentOptionsModel,
  LogisticsComponentModel,
} from './../Models/index';
import { LOGISTICS_COMPONENTS, SURVEY_REVIEW_BUSINESS_AREAS } from './../Enums/index';
import StepperStore from './Stepper.store';
import { AlertStore } from '@uvgo-shared/alert';
import {
  IAPIResponse,
  IAPISurvey,
  IAPICiq,
  IAPIArrivalLogistics,
  IAPISurveyDetails,
  IAPIDepartureLogistics,
  IAPIAirportEvents,
  IAPILogisticsComponent,
  UnSubmitPayload,
} from './../Interfaces';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { Utilities } from '@wings-shared/core';

const env = new EnvironmentVarsStore();
const headers = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.EVENTS_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};

export class AirportLogisticsStore extends BaseStore {
  private readonly endpointURL: string = env.getVar(ENVIRONMENT_VARS.AIRPORT_LOGISTICS_API);
  @observable public surveyList: SurveyListModel = new SurveyListModel();
  @observable public surveyDetail: SurveyDetailModel = new SurveyDetailModel();
  @observable public ciq: CiqModel = new CiqModel();
  @observable public arrivalLogistics: ArrivalLogisticsModel = new ArrivalLogisticsModel();
  @observable public departureLogistics: DepartureLogisticsModel = new DepartureLogisticsModel();
  @observable public airportEvents: AirportEventsModel = new AirportEventsModel();
  @observable public hasAccessedAirport: boolean = false;
  @observable public hasAccessedHandler: boolean = false;
  @observable
  public logisticsComponentOptions: LogisticsComponentOptionsModel = new LogisticsComponentOptionsModel();

  @action
  public setHasAccessedAirport(hasAccessed: boolean): void {
    this.hasAccessedAirport = hasAccessed;
  }

  @action
  public setHasAccessedHandler(hasAccessed: boolean): void {
    this.hasAccessedHandler = hasAccessed;
  }
  /* istanbul ignore next */
  @action
  public getCiqCrewPax(id: number): Observable<CiqModel> {
    const http = new HttpClient({ headers });
    return http
      .get<IAPIResponse<IAPICiq>>(`${this.endpointURL}${url.getCiqCrewPax}/${id}`)
      .pipe(
        Logger.observableCatchError,
        map(response => CiqModel.deserialize(response.Data)),
        tap(model => this.ciq = model));
  }
  /* istanbul ignore next */
  @action
  public getArrivalLogistics(id: number): Observable<ArrivalLogisticsModel> {
    const http = new HttpClient({ headers });
    return http
      .get<IAPIResponse<IAPIArrivalLogistics>>(`${this.endpointURL}${url.getArrivalLogistics}/${id}`)
      .pipe(
        Logger.observableCatchError,
        map(response => ArrivalLogisticsModel.deserialize(response.Data)),
        tap((model: ArrivalLogisticsModel) => this.arrivalLogistics = model));
  }
  /* istanbul ignore next */
  @action
  public getSurveys(submittedDateFrom?: string): Observable<SurveyListModel> {
    const http = new HttpClient({ headers });
    const params: string = Utilities.buildParamString({
      status: 'ALL',
      submittedDateFrom,
    });
    return http
      .get<IAPIResponse<IAPISurvey[]>>(`${this.endpointURL}${url.surveys}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => SurveyListModel.deserialize(response.Data)),
        tap((surveyList: SurveyListModel) => this.surveyList = surveyList));
  }
  /* istanbul ignore next */
  @action
  public getAirportEvents(id: number): Observable<AirportEventsModel> {
    const http = new HttpClient({ headers });
    return http
      .get<IAPIResponse<IAPIAirportEvents>>(`${this.endpointURL}${url.getAirportEvents}/${id}`)
      .pipe(
        Logger.observableCatchError,
        map(response => AirportEventsModel.deserialize(response.Data)),
        tap((airportEvents: AirportEventsModel) => this.airportEvents = airportEvents));
  }
  /* istanbul ignore next */
  @action
  public getAircraftLogistics(id: number): Observable<SurveyDetailModel> {
    const http = new HttpClient({ headers });
    return http
      .get<IAPIResponse<IAPISurveyDetails>>(`${this.endpointURL}${url.getAircraftLogisticsandParking}/${id}`)
      .pipe(
        Logger.observableCatchError,
        map(response => SurveyDetailModel.deserialize(response.Data)),
        tap((surveyDetail: SurveyDetailModel) => this.surveyDetail = surveyDetail));
  }
  /* istanbul ignore next */
  @action
  public getDepartureLogistics(id: number): Observable<DepartureLogisticsModel> {
    const http = new HttpClient({ headers });
    return http
      .get<IAPIResponse<IAPIDepartureLogistics>>(`${this.endpointURL}${url.getDepartureLogistics}/${id}`)
      .pipe(
        Logger.observableCatchError,
        map(response => DepartureLogisticsModel.deserialize(response.Data)),
        tap(model => this.departureLogistics = model));
  }
  /* istanbul ignore next */
  @action
  public getComponentList(component: LOGISTICS_COMPONENTS): Observable<LogisticsComponentModel[]> {
    const http = new HttpClient({ headers });
    return http
      .get<IAPIResponse<IAPILogisticsComponent[]>>(`${this.endpointURL}${url.getComponentList}?component=${component}`)
      .pipe(
        Logger.observableCatchError,
        map(response => LogisticsComponentModel.deserializeList(response.Data)),
        tap(options => this.updateComponentOptions(options, component)));
  }

  @action
  public updateComponentOptions(options: LogisticsComponentModel[], component: LOGISTICS_COMPONENTS): void {
    this.logisticsComponentOptions[component] = options;
  }

  public getSurveyInfoById(id: number): SurveyModel {
    return this.surveyList?.surveys?.find(survey => survey.id === id);
  }
  /* istanbul ignore next */
  @action
  public approveGroundLogistics(): Observable<SurveyDetailModel> {
    const data = this.surveyDetail.ApiModel(this.profile.name);
    const http = new HttpClient({ headers });
    return http
      .post<IAPIResponse>(`${this.endpointURL}${url.updateLogisticsAndParking}`, data)
      .pipe(
        switchMap(() => {
          return http
            .get<IAPIResponse<IAPISurveyDetails>>(
              `${this.endpointURL}${url.getAircraftLogisticsandParking}/${this.currentAirportLogisticsId}`
            )
            .pipe(
              Logger.observableCatchError,
              map(response => SurveyDetailModel.deserialize(response.Data)),
              tap((model: SurveyDetailModel) => this.surveyDetail = model));
        })
      );
  }
  /* istanbul ignore next */
  @action
  public approveCiq(): Observable<CiqModel> {
    const data = this.ciq.ApiModel(this.profile.name);
    const http = new HttpClient({ headers });
    return http
      .post<IAPIResponse>(`${this.endpointURL}${url.updateCiqCrewPax}`, data)
      .pipe(
        switchMap(() => {
          return http
            .get<IAPIResponse<IAPICiq>>(`${this.endpointURL}${url.getCiqCrewPax}/${this.currentAirportLogisticsId}`)
            .pipe(map(response => CiqModel.deserialize(response.Data)));
        }),
        Logger.observableCatchError,
        tap(ciq => this.ciq = ciq)
      );
  }
  /* istanbul ignore next */
  @action
  public approveArrivalLogistics(): Observable<ArrivalLogisticsModel> {
    const data = this.arrivalLogistics.ApiModel(this.profile.name);
    const http = new HttpClient({ headers });
    return http.post<IAPIResponse>(`${this.endpointURL}${url.updateArrivalLogistics}`, data).pipe(
      switchMap(() => {
        return http
          .get<IAPIResponse<IAPIArrivalLogistics>>(
            `${this.endpointURL}${url.getArrivalLogistics}/${this.currentAirportLogisticsId}`
          )
          .pipe(
            Logger.observableCatchError,
            map(response => ArrivalLogisticsModel.deserialize(response.Data)),
            tap((arrivalLogistics: ArrivalLogisticsModel) => this.arrivalLogistics = arrivalLogistics));
      })
    );
  }
  /* istanbul ignore next */
  @action
  public approveDepartureLogistics(): Observable<DepartureLogisticsModel> {
    const data = this.departureLogistics.ApiModel(this.profile.name);
    const http = new HttpClient({ headers });
    return http.post<IAPIResponse>(`${this.endpointURL}${url.updateDepartureLogistics}`, data).pipe(
      switchMap(() => {
        return http
          .get<IAPIResponse<IAPIDepartureLogistics>>(
            `${this.endpointURL}${url.getDepartureLogistics}/${this.currentAirportLogisticsId}`
          )
          .pipe(
            Logger.observableCatchError,
            map(response => DepartureLogisticsModel.deserialize(response.Data)),
            tap((departureLogistics: DepartureLogisticsModel) => this.departureLogistics = departureLogistics));
      })
    );
  }
  /* istanbul ignore next */
  @action
  public approveAirportEvents(): Observable<AirportEventsModel> {
    const data = this.airportEvents.ApiModel(this.profile.name);
    const http = new HttpClient({ headers });
    return http.post<IAPIResponse>(`${this.endpointURL}${url.updateAirportEvents}`, data).pipe(
      switchMap(() => {
        return http
          .get<IAPIResponse<IAPIAirportEvents>>(
            `${this.endpointURL}${url.getAirportEvents}/${this.currentAirportLogisticsId}`
          )
          .pipe(
            Logger.observableCatchError,
            map(response => AirportEventsModel.deserialize(response.Data)),
            tap((airportEvents: AirportEventsModel) => this.airportEvents = airportEvents)
          );
      }),
    );
  }

  @action
  public unSubmitAirportEvents(payload: UnSubmitPayload): Observable<string> {
    const http = new HttpClient({ headers });
    return http.put<IAPIResponse>(`${this.endpointURL}${url.unsubmitAirport}`, payload).pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Airport events unsubmitted successfully!'))
    );
  }

  public get profile(): { name: string } {
    return AuthStore.user ? { name: AuthStore.user.name } : null;
  }

  public getSurveyStatus(status: string): boolean {
    return status === SURVEY_STATUS.APPROVED;
  }

  public get currentAirportLogisticsId(): number {
    return this.surveyDetail?.surveyInfo?.id;
  }

  private get activeStep(): number {
    return StepperStore.activeStep;
  }

  @action
  resetSurveyDetails(): void {
    this.surveyDetail.reviewStatus = SURVEY_STATUS.PENDING;
    this.surveyDetail = null;
  }

  @action
  resetCiq(): void {
    if (this.ciq) {
      this.ciq.reviewStatus = SURVEY_STATUS.PENDING;
      this.ciq = null;
    }
  }

  @action
  resetArrivalLogistics(): void {
    if (this.arrivalLogistics) {
      this.arrivalLogistics.reviewStatus = SURVEY_STATUS.PENDING;
      this.arrivalLogistics = null;
    }
  }

  @action
  resetDepartureLogistics(): void {
    if (this.departureLogistics) {
      this.departureLogistics.reviewStatus = SURVEY_STATUS.PENDING;
      this.departureLogistics = null;
    }
  }

  @action
  resetAirportEvents(): void {
    if (this.airportEvents) {
      this.airportEvents.reviewStatus = SURVEY_STATUS.PENDING;
      this.airportEvents = null;
    }
  }

  resetData(businessArea: string): void {
    if (businessArea === 'ALL') {
      this.resetSurveyDetails();
      this.resetCiq();
      this.resetArrivalLogistics();
      this.resetDepartureLogistics();
      this.resetAirportEvents();
    } else if (businessArea === SURVEY_REVIEW_BUSINESS_AREAS.AIRCRAFT_GROUND_LOGISTICS_AND_PARKING) {
      this.resetSurveyDetails();
    } else if (businessArea === SURVEY_REVIEW_BUSINESS_AREAS.CIQ_LOGISTICS_CREW_PAX) {
      this.resetCiq();
    } else if (businessArea === SURVEY_REVIEW_BUSINESS_AREAS.ARRIVAL_LOGISTICS_CREW_PAX) {
      this.resetArrivalLogistics();
    } else if (businessArea === SURVEY_REVIEW_BUSINESS_AREAS.DEPARTURE_LOGISTICS_CREW_PAX) {
      this.resetDepartureLogistics();
    } else if (businessArea === SURVEY_REVIEW_BUSINESS_AREAS.EVENT_PERTINENT) {
      this.resetAirportEvents();
    }
  }

  @computed
  public get surveyInfo(): SurveyModel {

    let surveyInfo: SurveyModel = new SurveyModel();
    switch (this.activeStep) {
      case 1:
        surveyInfo = this.surveyDetail?.surveyInfo;
        break;
      case 2:
        surveyInfo = this.ciq?.surveyInfo;
        break;
      case 3:
        surveyInfo = this.arrivalLogistics?.surveyInfo;
        break;
      case 4:
        surveyInfo = this.departureLogistics?.surveyInfo;
        break;
      case 5:
        surveyInfo = this.airportEvents?.surveyInfo;
        break;
    }
    return surveyInfo;
  }

  @computed
  public get isSurveyApproved(): boolean {

    let isApproved: boolean = false;
    switch (this.activeStep) {
      case 1:
        isApproved = this.getSurveyStatus(this.surveyDetail?.reviewStatus);
        break;
      case 2:
        isApproved = this.getSurveyStatus(this.ciq?.reviewStatus);
        break;
      case 3:
        isApproved = this.getSurveyStatus(this.arrivalLogistics?.reviewStatus);
        break;
      case 4:
        isApproved = this.getSurveyStatus(this.departureLogistics?.reviewStatus);
        break;
      case 5:
        isApproved = this.getSurveyStatus(this.airportEvents?.reviewStatus);
        break;
    }
    return isApproved;
  }

  @computed
  public get hasAccessedAll(): boolean {
    return this.hasAccessedAirport && this.hasAccessedHandler;
  }
}
