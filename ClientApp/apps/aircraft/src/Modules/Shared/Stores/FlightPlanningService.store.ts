import { baseApiPath, HttpClient, NO_SQL_COLLECTIONS, BaseStore } from '@wings/shared';
import { action, observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FlightPlanningServiceModel, RegistryAssociationDetailModel, RegistryAssociationModel } from '../Models';
import {
  IAPIFlightPlanningService,
  IAPICustomers,
  IAPIRegistryAssociation,
  IAPIRegistryAssociationDetail,
} from '../Interfaces';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  Utilities,
  tapWithAction,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';

export class FlightPlanningServiceStore extends BaseStore {
  @observable public selectedFlightPlanningService: FlightPlanningServiceModel;
  @observable public flightPlanningServices: FlightPlanningServiceModel[] = [];
  @observable public customers: IdNameCodeModel[] = [];
  @observable public registry: RegistryAssociationModel[] = [];
  @observable public registryDetail: RegistryAssociationDetailModel[] = [];

  @action
  public setSelectedFlightPlanningService(flightPlanningServices: Partial<FlightPlanningServiceModel>): void {
    this.selectedFlightPlanningService = new FlightPlanningServiceModel(flightPlanningServices);
  }

  /* istanbul ignore next */
  public getFlightPlanningServices(forceRefresh?: boolean): Observable<IAPIPageResponse<FlightPlanningServiceModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.FLIGHT_PLANNING_SERVICE,
    });

    return http.get<IAPIPageResponse<IAPIFlightPlanningService>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: FlightPlanningServiceModel.deserializeList(response.results) })),
      tapWithAction(response => (this.flightPlanningServices = response.results))
    );
  }

  /* istanbul ignore next */
  public removeFlightPlanningService(customersWithNonStandardRunwayAnalysisId: number): Observable<string> {
    const params = {
      customersWithNonStandardRunwayAnalysisId,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http.delete<string>(`${apiUrls.flightPlanningService}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Flight Planning service deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public upsertFlightPlanningService(data: FlightPlanningServiceModel): Observable<FlightPlanningServiceModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const upsertRequest: Observable<IAPIFlightPlanningService> = http.post<IAPIFlightPlanningService>(
      apiUrls.flightPlanningService,
      data.serialize()
    );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIFlightPlanningService) => FlightPlanningServiceModel.deserialize(response)),
      tap(() => AlertStore.info('Flight Planning service created successfully!'))
    );
  }

  /* istanbul ignore next */
  public getCustomers(request?: IAPIGridRequest): Observable<IAPIPageResponse<SettingsTypeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.CUSTOMERS,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICustomers>>(`${apiUrls.referenceData}/uvgo?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        return {
          ...response,
          results: response.results.map(
            a => new IdNameCodeModel({ name: a.customerName, code: a.customerNumber, id: Number(a.customerNumber) })
          ),
        };
      }),
      tapWithAction(response => (this.customers = response.results))
    );
  }

  /* istanbul ignore next */
  public getRegistryAssociation(request?: IAPIGridRequest): Observable<IAPIPageResponse<FlightPlanningServiceModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIRegistryAssociation>>(
        `${apiUrls.customersWithNonStandardRunwayAnalysisRegistry}?${params}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: RegistryAssociationModel.deserializeList(response.results) })),
        tapWithAction(response => (this.flightPlanningServices = response.results))
      );
  }

  /* istanbul ignore next */
  public removeRegistryAssociation(id: number): Observable<string> {
    const params = {
      id: id,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http.delete<string>(`${apiUrls.customersWithNonStandardRunwayAnalysisRegistry}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Registry Association deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public upsertRegistryAssociation(registry: IAPIRegistryAssociation): Observable<RegistryAssociationModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isAddRegion: boolean = registry.id === 0;
    const upsertRequest: Observable<IAPIRegistryAssociation> = isAddRegion
      ? http.post<IAPIRegistryAssociation>(apiUrls.customersWithNonStandardRunwayAnalysisRegistry, registry)
      : http.put<IAPIRegistryAssociation>(
        `${apiUrls.customersWithNonStandardRunwayAnalysisRegistry}/${registry.id}`,
        registry
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: any) => RegistryAssociationModel.deserialize(response)),
      tap(() => AlertStore.info(`Registry Association ${isAddRegion ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public upsertRegistryAssociationDetail(
    registry: IAPIRegistryAssociationDetail
  ): Observable<RegistryAssociationDetailModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isAddRegion: boolean = registry.id === 0;

    const upsertRequest: Observable<IAPIRegistryAssociationDetail> = isAddRegion
      ? http.post<IAPIRegistryAssociationDetail>(apiUrls.customersWithNonStandardRunwayAnalysisRegistryOption, registry)
      : http.put<IAPIRegistryAssociationDetail>(
        `${apiUrls.customersWithNonStandardRunwayAnalysisRegistryOption}/${registry.id}`,
        registry
      );
    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: any) => RegistryAssociationDetailModel.deserialize(response)),
      tap(() => AlertStore.info(`Registry Association Detail ${isAddRegion ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getRegistryAssociationDetail(id?: number): Observable<RegistryAssociationDetailModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params = {
      id: id,
    };
    return http
      .get<IAPIPageResponse<IAPIRegistryAssociationDetail>>(
        `${apiUrls.customersWithNonStandardRunwayAnalysisRegistryOption}/${id}`
      )
      .pipe(
        Logger.observableCatchError,
        map(response => RegistryAssociationDetailModel.deserialize(response))
      );
  }
}
