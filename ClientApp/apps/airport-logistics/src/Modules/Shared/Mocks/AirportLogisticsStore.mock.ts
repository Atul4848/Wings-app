import { Observable, of } from 'rxjs';
import {
  SurveyListModel,
  SurveyDetailModel,
  CiqModel,
  ArrivalLogisticsModel,
  DepartureLogisticsModel,
  AirportEventsModel,
  LogisticsComponentModel,
} from './../Models/index';
import { AirportLogisticsStore } from '../Stores';
import { tap } from 'rxjs/operators';
import { LOGISTICS_COMPONENTS } from '../Enums';


export class AirportLogisticsStoreMock extends AirportLogisticsStore {

  public getCiqCrewPax(id: number): Observable<CiqModel> {
    return of(new CiqModel()).pipe(
      tap(model => this.ciq = model),
    );
  }

  public getArrivalLogistics(id: number): Observable<ArrivalLogisticsModel> {
    return of(new ArrivalLogisticsModel()).pipe(
      tap((model: ArrivalLogisticsModel) => this.arrivalLogistics = model),
    )
  }

  public getSurveys(submittedDateFrom?: string): Observable<SurveyListModel> {
    return of(new SurveyListModel()).pipe(tap((surveyList: SurveyListModel) => this.surveyList = surveyList));
  }

  public getAirportEvents(id: number): Observable<AirportEventsModel> {
    return of(new AirportEventsModel()).pipe(
      tap(model => this.airportEvents = model)
    );
  }

  public getAircraftLogistics(id: number): Observable<SurveyDetailModel> {
    return of(new SurveyDetailModel({})).pipe(tap(model => this.surveyDetail = model));
  }

  public getDepartureLogistics(id: number): Observable<DepartureLogisticsModel> {
    return of(new DepartureLogisticsModel()).pipe(
      tap(model => this.departureLogistics = model),
    );
  }

  public getComponentList(component: LOGISTICS_COMPONENTS): Observable<LogisticsComponentModel[]> {
    return of([ new LogisticsComponentModel() ])
      .pipe(tap(model => this.updateComponentOptions(model, component)));
  }

  public approveGroundLogistics(): Observable<SurveyDetailModel> {
    return of(new SurveyDetailModel()).pipe(tap((model: SurveyDetailModel) => this.surveyDetail = model));
  }

  public approveCiq(): Observable<CiqModel> {
    return of(new CiqModel()).pipe(tap(ciq => this.ciq = ciq));
  }

  public approveArrivalLogistics(): Observable<ArrivalLogisticsModel> {
    return of(new ArrivalLogisticsModel()).pipe(
      tap((arrivalLogistics: ArrivalLogisticsModel) => this.arrivalLogistics = arrivalLogistics),
    );
  }

  public approveDepartureLogistics(): Observable<DepartureLogisticsModel> {
    return of(new DepartureLogisticsModel()).pipe(
      tap((departureLogistics: DepartureLogisticsModel) => this.departureLogistics = departureLogistics),
    );
  }

  public approveAirportEvents(): Observable<AirportEventsModel> {
    return of(new AirportEventsModel()).pipe(
      tap((airportEvents: AirportEventsModel) => this.airportEvents = airportEvents)
    );
  }
}
