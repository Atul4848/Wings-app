import { AirportStore } from '../Stores';
import {
  AirportFlightPlanInfoModel,
  AirportFrequencyModel,
  AirportMappingsBetaModel,
  AirportModel,
  AirportRunwayModel,
  AssociatedRunwayModel,
  FAAImportComparisonModel,
  FAAImportProcess,
} from '../Models';
import { Observable, of } from 'rxjs';
import { CityModel, CountryModel, FileMock, FIRModel, IslandModel, MetroModel, StateModel } from '@wings/shared';
import { AuditHistoryModel, IAPIGridRequest, IAPIPageResponse, tapWithAction } from '@wings-shared/core';
import { IAPIValidateAirport } from '../Interfaces';

export class AirportStoreMock extends AirportStore {
  constructor() {
    super();
    this.setSelectedAirport(
      new AirportModel({ runways: [ new AirportRunwayModel() ], primaryRunway: new AirportRunwayModel({ id: 1 }) })
    );

    this.setSelectedFaaImportProcess(new FAAImportProcess({ processDate: '27-Mar-2024' }));
  }
  public getAirports(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<AirportModel>> {
    return of({
      pageNumber: 1,
      pageSize: 10,
      totalNumberOfRecords: 1,
      results: [ new AirportModel() ],
    }).pipe(tapWithAction(response => (this.airports = response.results)));
  }

  public getStates(request?: IAPIGridRequest): Observable<IAPIPageResponse<StateModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new StateModel(), new StateModel() ],
    }).pipe(tapWithAction(response => (this.states = response.results)));
  }

  public getCities(request: IAPIGridRequest): Observable<IAPIPageResponse<CityModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new CityModel(), new CityModel() ],
    }).pipe(tapWithAction(response => (this.cities = response.results)));
  }

  public getIslands(request?: IAPIGridRequest): Observable<IAPIPageResponse<IslandModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new IslandModel(), new IslandModel() ],
    }).pipe(tapWithAction(response => (this.islands = response.results)));
  }

  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new CountryModel(), new CountryModel() ],
    }).pipe(tapWithAction(response => (this.countries = response.results)));
  }

  public getFIRs(request?: IAPIGridRequest): Observable<IAPIPageResponse<FIRModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new FIRModel(), new FIRModel() ],
    }).pipe(tapWithAction(response => (this.firs = response.results)));
  }

  public getMetros(request?: IAPIGridRequest): Observable<MetroModel[]> {
    return of([ new MetroModel(), new MetroModel() ]);
  }

  public loadAuditHistory(id: number, entityName: string): Observable<AuditHistoryModel[]> {
    return of([ new AuditHistoryModel({ id: 1 }) ]);
  }

  public getFAAImportProcess(): Observable<IAPIPageResponse<FAAImportProcess>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new FAAImportProcess(), new FAAImportProcess() ],
    }).pipe(tapWithAction(response => FAAImportProcess.deserialize(response)));
  }

  public getFAAImportComparison(): Observable<IAPIPageResponse<FAAImportComparisonModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new FAAImportComparisonModel(), new FAAImportComparisonModel() ],
    }).pipe(tapWithAction(response => FAAImportComparisonModel.deserialize(response)));
  }

  public getCodeStatus(code: string): Observable<boolean> {
    return of(true);
  }

  public loadAirportMappingsBeta(): Observable<IAPIPageResponse<AirportMappingsBetaModel>> {
    return of({
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [
        new AirportMappingsBetaModel({
          airportFlightPlanInfo: new AirportFlightPlanInfoModel({ navBlueCode: 'ABC' }),
        }),
      ],
    }).pipe(tapWithAction(response => AirportMappingsBetaModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public upsertAirportFlightPlanInfo(request: AirportFlightPlanInfoModel): Observable<AirportFlightPlanInfoModel> {
    return of(new AirportFlightPlanInfoModel());
  }

  /* istanbul ignore next */
  public upsertAirportFrequency(request: AirportFrequencyModel): Observable<AirportFrequencyModel> {
    return of(new AirportFrequencyModel());
  }

  /* istanbul ignore next */
  public downloadRuralAirportData(processId: string): Observable<File> {
    return of(new FileMock().testFile);
  }

  public upsertAssociatedRunway(request: AssociatedRunwayModel): Observable<AssociatedRunwayModel> {
    return of(new AssociatedRunwayModel());
  }

  public validateAirportCodes(request: IAPIValidateAirport): Observable<AirportModel> {
    return of(new AirportModel());
  }
}
