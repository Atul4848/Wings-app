import { observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ISettingFilter } from '../Interfaces';
import { FARTypeModel } from '../Models';
import { HttpClient } from '../Tools';
import { BaseStore } from './Base.store';
import { AlertStore } from '@uvgo-shared/alert';
import { apiUrls } from './ApiUrls';
import { baseApiPath } from '../API';
import { Logger } from '@wings-shared/security';
import {
  IAPIPageResponse,
  IBaseApiResponse,
  Utilities,
  tapWithAction,
  SettingsTypeModel,
  SEARCH_ENTITY_TYPE,
  IAPIGridRequest,
  IdNameCodeModel,
  IAPIIdNameCode,
} from '@wings-shared/core';
import { NO_SQL_COLLECTIONS } from '../Enums';

export class SettingsBaseStore extends BaseStore {
  @observable public accessLevels: SettingsTypeModel[] = [];
  @observable public sourceTypes: SettingsTypeModel[] = [];
  @observable public farTypes: FARTypeModel[] = [];
  @observable public noiseChapters: SettingsTypeModel[] = [];
  @observable public aircraftVariations: IdNameCodeModel[] = [];
  @observable public bulletinLevels: SettingsTypeModel[] = [];
  @observable public bulletinTypes: SettingsTypeModel[] = [];
  @observable public weightUOM: SettingsTypeModel[] = [];
  @observable public sources: SettingsTypeModel[] = [];
  @observable public bulletinPriorities: SettingsTypeModel[] = [];
  @observable public cappsCategory: IdNameCodeModel[] = [];
  @observable public airportOfEntry: IdNameCodeModel[] = [];
  @observable public flightPurposes: SettingsTypeModel[] = [];
  @observable public crossingTypes: SettingsTypeModel[] = [];
  @observable public aircraftCategories: SettingsTypeModel[] = [];

  protected http: HttpClient;

  constructor(baseURL: string) {
    super();
    this.http = new HttpClient({ baseURL });
  }

  /* istanbul ignore next */
  /* istanbul ignore next */
  public loadAirportOfEntries(pageRequest?: IAPIGridRequest): Observable<IdNameCodeModel[]> {
    if (this.airportOfEntry?.length) {
      return of(this.airportOfEntry);
    }
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.airports });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRPORT_OF_ENTRY,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIIdNameCode>>(`${apiUrls.airportOfEntry}?${params}`).pipe(
      map(response => IdNameCodeModel.deserializeList(response.results)),
      tapWithAction(response => (this.airportOfEntry = response.results))
    );
  }

  /* istanbul ignore next */
  public getFarTypes(forceRefresh?: boolean): Observable<FARTypeModel[]> {
    return this.getResult(apiUrls.farType, this.farTypes, forceRefresh, FARTypeModel.deserializeList, {
      baseUrl: baseApiPath.permits,
    }).pipe(tapWithAction(farTypes => (this.farTypes = farTypes)));
  }

  public getNoiseChapters(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.noiseChapter, this.noiseChapters, forceRefresh, SettingsTypeModel.deserializeList, {
      baseUrl: baseApiPath.aircraft,
    }).pipe(tapWithAction(response => (this.noiseChapters = response)));
  }

  public getAircraftVariations(request?: IAPIGridRequest): Observable<IAPIPageResponse<IdNameCodeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.AIRCRAFT_VARIATION,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIIdNameCode>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({
        ...response,
        results: response.results.map(
          x => new IdNameCodeModel({ ...x, id: x.aircraftVariationId, name: x.cappsRecordId })
        ),
      })),
      tap(response => (this.aircraftVariations = response.results))
    );
  }

  /* istanbul ignore next */
  public getSourceTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.sourceType, this.sourceTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(sourceTypes => (this.sourceTypes = sourceTypes))
    );
  }

  /* istanbul ignore next */
  public upsertSourceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSourceType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.sourceType, 'Source Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((sourceTypes: SettingsTypeModel) => {
        this.sourceTypes = Utilities.updateArray<SettingsTypeModel>(this.sourceTypes, sourceTypes, {
          replace: !isAddSourceType,
          predicate: t => t.id === sourceTypes.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAccessLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.accessLevel, this.accessLevels, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(accessLevels => (this.accessLevels = accessLevels))
    );
  }

  /* istanbul ignore next */
  public upsertAccessLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddAccessLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.accessLevel, 'Access Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((accessLevels: SettingsTypeModel) => {
        this.accessLevels = Utilities.updateArray<SettingsTypeModel>(this.accessLevels, accessLevels, {
          replace: !isAddAccessLevel,
          predicate: t => t.id === accessLevels.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  protected getResult<T, APIResponse>(
    apiUrl: string,
    currentData: T[],
    forceRefresh: boolean,
    deserializeList: (data: APIResponse[], idKey?: string) => T[],
    obj?: ISettingFilter
  ): Observable<T[]> {
    if (currentData?.length && !forceRefresh) {
      return of(currentData);
    }
    const httpClient: HttpClient = Boolean(obj?.baseUrl) ? new HttpClient({ baseURL: obj.baseUrl }) : this.http;
    const _params: string = Utilities.buildParamString({ pageSize: 0, ...obj?.params });
    return httpClient.get<IAPIPageResponse<IBaseApiResponse>>(`${apiUrl}?${_params}`).pipe(
      Logger.observableCatchError,
      map(res => Utilities.customArraySort<T>(deserializeList(res.results, obj?.idKey), obj?.sortKey))
    );
  }

  /* istanbul ignore next */
  protected upsert<T extends IBaseApiResponse>(request: T, url: string, settingType: string): Observable<T> {
    const isNewRequest: boolean = request.id === 0;

    const mappings = [
      { key: 'sourceType', idKey: 'sourceTypeId' },
      { key: 'accessLevel', idKey: 'accessLevelId' },
      { key: 'status', idKey: 'statusId' },
    ];
    
    mappings.forEach(({ key, idKey }) => {
      const keyValue = request[key];
      const idValue = request[idKey];
    
      if (keyValue && !idValue) {
        const resolvedId = keyValue?.id || keyValue?.[idKey];
        if (resolvedId) request[idKey] = resolvedId;
      }
    
      delete request[key];
    });
    
    if (!request.sourceTypeId) delete request.sourceTypeId;

    const upsertRequest: Observable<T> = isNewRequest
      ? this.http.post<T>(url, request)
      : this.http.put<T>(`${url}/${request.id}`, request);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info(`${settingType} ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getBulletinLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.bulletinLevel,
      this.bulletinLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction(
        bulletinLevels =>
          (this.bulletinLevels = bulletinLevels.filter(x => Object.values(SEARCH_ENTITY_TYPE).includes(x.name)))
      )
    );
  }

  /* istanbul ignore next */
  public upsertBulletinLevels(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddBulletinLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.bulletinLevel, 'Bulletin Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((bulletinLevels: SettingsTypeModel) => {
        this.bulletinLevels = Utilities.updateArray<SettingsTypeModel>(this.bulletinLevels, bulletinLevels, {
          replace: !isAddBulletinLevel,
          predicate: t => t.id === bulletinLevels.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getBulletinTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.bulletinType, this.bulletinTypes, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction(bulletinTypes => (this.bulletinTypes = bulletinTypes)));
  }

  /* istanbul ignore next */
  public upsertBulletinTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddBulletinType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.bulletinType, 'Bulletin Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((bulletinTypes: SettingsTypeModel) => {
        this.bulletinTypes = Utilities.updateArray<SettingsTypeModel>(this.bulletinTypes, bulletinTypes, {
          replace: !isAddBulletinType,
          predicate: t => t.id === bulletinTypes.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getWeightUOM(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.weightUOM, this.weightUOM, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction(weightUOM => (this.weightUOM = weightUOM)));
  }

  /* istanbul ignore next */
  public upsertWeightUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddWeightUOM: boolean = request.id === 0;
    return this.upsert(request, apiUrls.weightUOM, 'WeightUOM').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((weightUOM: SettingsTypeModel) => {
        this.weightUOM = Utilities.updateArray<SettingsTypeModel>(this.weightUOM, weightUOM, {
          replace: !isAddWeightUOM,
          predicate: t => t.id === weightUOM.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getSources(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.bulletinSource, this.sources, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(sources => (this.sources = sources))
    );
  }

  /* istanbul ignore next */
  public upsertSources(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSource: boolean = request.id === 0;
    return this.upsert(request, apiUrls.bulletinSource, 'Bulletin Source').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((sources: SettingsTypeModel) => {
        this.sources = Utilities.updateArray<SettingsTypeModel>(this.sources, sources, {
          replace: !isAddSource,
          predicate: t => t.id === sources.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getBulletinPriorities(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.bulletinPriority,
      this.bulletinPriorities,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(bulletinPriorities => (this.bulletinPriorities = bulletinPriorities)));
  }

  /* istanbul ignore next */
  public upsertBulletinPriorities(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddPriority: boolean = request.id === 0;
    return this.upsert(request, apiUrls.bulletinPriority, 'Bulletin Priority').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((bulletinPriority: SettingsTypeModel) => {
        this.bulletinPriorities = Utilities.updateArray<SettingsTypeModel>(this.bulletinPriorities, bulletinPriority, {
          replace: !isAddPriority,
          predicate: t => t.id === bulletinPriority.id,
        });
      })
    );
  }

  public loadCappsCategory(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return this.getResult(
      apiUrls.cappsCategory,
      this.cappsCategory,
      forceRefresh,
      IdNameCodeModel.deserializeList
    ).pipe(tapWithAction(cappsCategpory => (this.cappsCategory = cappsCategpory)));
  }

  /* istanbul ignore next */
  public upsertCappsCategory(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.cappsCategory, 'Capps Category Code').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((response: IdNameCodeModel) => {
        this.cappsCategory = Utilities.updateArray<IdNameCodeModel>(this.cappsCategory, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFlightPurposes(): Observable<SettingsTypeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get<IAPIPageResponse<IBaseApiResponse>>(`${apiUrls.purposeOfFlight}?${params}`).pipe(
      map(response => SettingsTypeModel.deserializeList(response.results)),
      tapWithAction(response => (this.flightPurposes = response.results))
    );
  }

  /* istanbul ignore next */
  public getCrossingTypes(): Observable<SettingsTypeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get<IAPIPageResponse<IBaseApiResponse>>(`${apiUrls.crossingType}?${params}`).pipe(
      map(response => SettingsTypeModel.deserializeList(response.results)),
      tapWithAction(response => (this.crossingTypes = response.results))
    );
  }

  /* istanbul ignore next */
  public getAircraftCategories(): Observable<SettingsTypeModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get<IAPIPageResponse<IBaseApiResponse>>(`${apiUrls.aircraftCategory}?${params}`).pipe(
      map(response => SettingsTypeModel.deserializeList(response.results)),
      tapWithAction(response => (this.aircraftCategories = response.results))
    );
  }
}
