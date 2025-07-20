import {
  baseApiPath,
  CountryModel,
  HttpClient,
  IAPICountry,
  NO_SQL_COLLECTIONS,
  SettingsBaseStore,
} from '@wings/shared';
import { observable } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  AerodromeRefCodeModel,
  AircraftModel,
  EngineTypeModel,
  FuelReservePolicyModel,
  NavBlueGenericRegistryModel,
  NoiseChapterConfigurationModel,
  RegistryIdentifierCountryModel,
  RegistrySequenceBaseModel,
  SeriesModel,
  SubCategoryModel,
  TypeDesignatorModel,
} from '../Models';
import {
  IAPIAerodromeRefCode,
  IAPIAircraftModel,
  IAPIEngineType,
  IAPINavBlueGenericRegistry,
  IAPINoiseChapterConfiguration,
  IAPIRegistryIdentifierCountry,
  IAPISeries,
  IAPISubCategory,
  IAPITypeDesignator,
} from '../Interfaces';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  tapWithAction,
  Utilities,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';

export class SettingsStore extends SettingsBaseStore {
  @observable public registryIdentifierCountries: RegistryIdentifierCountryModel[] = [];
  @observable public countries: CountryModel[] = [];
  @observable public icaoTypeDesignators: TypeDesignatorModel[] = [];
  @observable public wakeTurbulenceCategories: SettingsTypeModel[] = [];
  @observable public aerodromeRefCodes: AerodromeRefCodeModel[] = [];
  @observable public categories: SettingsTypeModel[] = [];
  @observable public distanceUOMs: SettingsTypeModel[] = [];
  @observable public aircraftModels: AircraftModel[] = [];
  @observable public makes: SettingsTypeModel[] = [];
  @observable public noiseChapters: SettingsTypeModel[] = [];
  @observable public fuelTypeProfile: SettingsTypeModel[] = [];
  @observable public fireCategories: SettingsTypeModel[] = [];
  @observable public rangeUOMs: SettingsTypeModel[] = [];
  @observable public weightUOMs: SettingsTypeModel[] = [];
  @observable public aircraftModifications: SettingsTypeModel[] = [];
  @observable public series: SeriesModel[] = [];
  @observable public engineTypes: EngineTypeModel[] = [];
  @observable public aircraftColors: SettingsTypeModel[] = [];
  @observable public airframeStatus: SettingsTypeModel[] = [];
  @observable public flightPlanFormatStatus: SettingsTypeModel[] = [];
  @observable public subCategories: SubCategoryModel[] = [];
  @observable public windUOMs: SettingsTypeModel[] = [];
  @observable public fuelReservePolicies: FuelReservePolicyModel[] = [];
  @observable public stcManufactures: SettingsTypeModel[] = [];
  @observable public aircraftNoiseTypes: SettingsTypeModel[] = [];
  @observable public noiseDateTypeCertifications: SettingsTypeModel[] = [];
  @observable public radios: RegistrySequenceBaseModel[] = [];
  @observable public noiseChapterConfigurations: NoiseChapterConfigurationModel[] = [];
  @observable public acases: SettingsTypeModel[] = [];
  @observable public transponders: IdNameCodeModel[] = [];
  @observable public militaryDesignations: SettingsTypeModel[] = [];
  @observable public navBlueGenericRegistries: NavBlueGenericRegistryModel[] = [];
  @observable public otherNames: SettingsTypeModel[] = [];
  @observable public wakeTurbulenceGroups: SettingsTypeModel[] = [];
  @observable public popularNames: SettingsTypeModel[] = [];
  @observable public propulsionType: SettingsTypeModel[] = [];
  @observable public flightPlanningServiceTypes: SettingsTypeModel[] = [];
  @observable public runwayAnalysisType: SettingsTypeModel[] = [];
  @observable public deliveryPackageType: SettingsTypeModel[] = [];
  @observable public uplinkVendor: SettingsTypeModel[] = [];
  @observable public cateringHeatingElement: SettingsTypeModel[] = [];
  @observable public outerMainGearWheelSpan: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.aircraft);
  }

  /* istanbul ignore next */
  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.COUNTRY,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPICountry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: CountryModel.deserializeList(response.results) })),
      tapWithAction(response => (this.countries = response.results))
    );
  }

  /* istanbul ignore next */
  public getRegistryIdentifierCountries(forceRefresh?: boolean): Observable<RegistryIdentifierCountryModel[]> {
    return this.getResult(
      apiUrls.registryIdentifierCountry,
      this.registryIdentifierCountries,
      forceRefresh,
      RegistryIdentifierCountryModel.deserializeList
    ).pipe(tapWithAction(response => (this.registryIdentifierCountries = response)));
  }

  /* istanbul ignore next */
  public getFuelTypeProfile(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.fuelTypeProfile,
      this.fuelTypeProfile,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(fuelTypeProfile => (this.fuelTypeProfile = fuelTypeProfile)));
  }

  /* istanbul ignore next */
  public upsertFuelTypeProfile(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSourceType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.fuelTypeProfile, 'Fuel Type profile').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((fuelTypeProfile: SettingsTypeModel) => {
        this.fuelTypeProfile = Utilities.updateArray<SettingsTypeModel>(this.fuelTypeProfile, fuelTypeProfile, {
          replace: !isAddSourceType,
          predicate: t => t.id === fuelTypeProfile.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFireCategory(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.fireCategory, this.fireCategories, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(fireCategory => (this.fireCategories = fireCategory)));
  }

  /* istanbul ignore next */
  public upsertFireCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSourceType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.fireCategory, 'Fire Category').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((fireCategory: SettingsTypeModel) => {
        this.fireCategories = Utilities.updateArray<SettingsTypeModel>(this.fireCategories, fireCategory, {
          replace: !isAddSourceType,
          predicate: t => t.id === fireCategory.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public upsertRegistryIdentifierCountry(
    request: RegistryIdentifierCountryModel
  ): Observable<RegistryIdentifierCountryModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPIRegistryIdentifierCountry>(
      request.serialize(),
      apiUrls.registryIdentifierCountry,
      'Registry Identifier Country'
    ).pipe(
      map((response: IAPIRegistryIdentifierCountry) => RegistryIdentifierCountryModel.deserialize(response)),
      tapWithAction((registryIdentifierCountry: RegistryIdentifierCountryModel) => {
        this.registryIdentifierCountries = Utilities.updateArray<RegistryIdentifierCountryModel>(
          this.registryIdentifierCountries,
          registryIdentifierCountry,
          {
            replace: !isNewRequest,
            predicate: t => t.id === registryIdentifierCountry.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getMakes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.aircraftMake, this.makes, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(makes => (this.makes = makes)));
  }

  /* istanbul ignore next */
  public upsertMake(request?: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.aircraftMake, 'Aircraft Makes').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((make: SettingsTypeModel) => {
        this.makes = Utilities.updateArray<SettingsTypeModel>(this.makes, make, {
          replace: !isAddRequest,
          predicate: t => t.id === make.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAircraftModels(forceRefresh?: boolean): Observable<AircraftModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.aircraftModel, this.aircraftModels, forceRefresh, AircraftModel.deserializeList, {
      params,
    }).pipe(tapWithAction(response => (this.aircraftModels = response)));
  }

  /* istanbul ignore next */
  public getICAOTypeDesignators(forceRefresh?: boolean): Observable<TypeDesignatorModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.ICAOTypeDesignator,
      this.icaoTypeDesignators,
      forceRefresh,
      TypeDesignatorModel.deserializeList,
      { params }
    ).pipe(tapWithAction(typeDesignators => (this.icaoTypeDesignators = typeDesignators)));
  }

  /* istanbul ignore next */
  public upsertICAOTypeDesignator(request: TypeDesignatorModel): Observable<TypeDesignatorModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert<IAPITypeDesignator>(
      request.serialize(),
      apiUrls.ICAOTypeDesignator,
      'ICAO Type Designator'
    ).pipe(
      map((response: IAPITypeDesignator) => TypeDesignatorModel.deserialize(response)),
      tapWithAction((settingsType: TypeDesignatorModel) => {
        this.icaoTypeDesignators = Utilities.updateArray<TypeDesignatorModel>(this.icaoTypeDesignators, settingsType, {
          replace: !isAddRequest,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public removeICAOTypeDesignator(request: TypeDesignatorModel): Observable<string> {
    const params = {
      icaoTypeDesignatorId: request.id,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http.delete<string>(`${apiUrls.ICAOTypeDesignator}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('ICAO Type Designator deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public getNoiseChapters(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.noiseChapter, this.noiseChapters, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(noiseChapter => (this.noiseChapters = noiseChapter)));
  }

  /* istanbul ignore next */
  public upsertNoiseChapter(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.noiseChapter, 'Noise Chapter').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.noiseChapters = Utilities.updateArray<SettingsTypeModel>(this.noiseChapters, settingsType, {
          replace: !isAddRequest,
          predicate: t => t.id === settingsType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getWakeTurbulenceCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.wakeTurbulence,
      this.wakeTurbulenceCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(wakeTurbulenceCategories => (this.wakeTurbulenceCategories = wakeTurbulenceCategories)));
  }

  /* istanbul ignore next */
  public upsertWakeTurbulenceCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.wakeTurbulence, 'Wake Turbulence Category').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((settingsType: SettingsTypeModel) => {
        this.wakeTurbulenceCategories = Utilities.updateArray<SettingsTypeModel>(
          this.wakeTurbulenceCategories,
          settingsType,
          {
            replace: !isAddRequest,
            predicate: t => t.id === settingsType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getAerodromeRefCodes(forceRefresh?: boolean): Observable<AerodromeRefCodeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Code', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.aerodromeRefCode,
      this.aerodromeRefCodes,
      forceRefresh,
      AerodromeRefCodeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(aerodromeRefCodes => (this.aerodromeRefCodes = aerodromeRefCodes)));
  }

  /* istanbul ignore next */
  public upsertAerodromeRefCode(request: AerodromeRefCodeModel): Observable<AerodromeRefCodeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPIAerodromeRefCode>(
      request.serialize(),
      apiUrls.aerodromeRefCode,
      'ICAO Aerodrome Reference Code'
    ).pipe(
      map((response: IAPIAerodromeRefCode) => AerodromeRefCodeModel.deserialize(response)),
      tapWithAction((aerodromeRefCode: AerodromeRefCodeModel) => {
        this.aerodromeRefCodes = Utilities.updateArray<AerodromeRefCodeModel>(
          this.aerodromeRefCodes,
          aerodromeRefCode,
          {
            replace: !isNewRequest,
            predicate: t => t.id === aerodromeRefCode.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.category, this.categories, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(categories => (this.categories = categories)));
  }

  /* istanbul ignore next */
  public upsertCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.category, 'Category').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((category: SettingsTypeModel) => {
        this.categories = Utilities.updateArray<SettingsTypeModel>(this.categories, category, {
          replace: !isAddRequest,
          predicate: t => t.id === category.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getDistanceUOMs(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.distanceUOM, this.distanceUOMs, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(distanceUOMs => (this.distanceUOMs = distanceUOMs))
    );
  }

  /* istanbul ignore next */
  public upsertDistanceUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.distanceUOM, 'Distance UOM').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((distanceUOM: SettingsTypeModel) => {
        this.distanceUOMs = Utilities.updateArray<SettingsTypeModel>(this.distanceUOMs, distanceUOM, {
          replace: !isAddRequest,
          predicate: t => t.id === distanceUOM.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public upsertAircraftModel(request: AircraftModel): Observable<AircraftModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPIAircraftModel>(request.serialize(), apiUrls.aircraftModel, 'Aircraft Model').pipe(
      map((response: IAPIAircraftModel) => AircraftModel.deserialize(response)),
      tapWithAction((aircraftModel: AircraftModel) => {
        this.aircraftModels = Utilities.updateArray<AircraftModel>(this.aircraftModels, aircraftModel, {
          replace: !isNewRequest,
          predicate: t => t.id === aircraftModel.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getSeries(forceRefresh?: boolean): Observable<SeriesModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.series, this.series, forceRefresh, SeriesModel.deserializeList, { params }).pipe(
      tapWithAction(response => (this.series = response))
    );
  }

  /* istanbul ignore next */
  public upsertSeries(request: SeriesModel): Observable<SeriesModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPISeries>(request.serialize(), apiUrls.series, 'Series').pipe(
      map((response: IAPISeries) => SeriesModel.deserialize(response)),
      tapWithAction((series: SeriesModel) => {
        this.series = Utilities.updateArray<SeriesModel>(this.series, series, {
          replace: !isNewRequest,
          predicate: t => t.id === series.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public removeSeries(request: SeriesModel): Observable<string> {
    const params = {
      seriesId: request.id,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http.delete<string>(`${apiUrls.series}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Series deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public getEngineTypes(forceRefresh?: boolean): Observable<EngineTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.engineType, this.engineTypes, forceRefresh, EngineTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(response => (this.engineTypes = response)));
  }

  /* istanbul ignore next */
  public upsertEngineType(request: EngineTypeModel): Observable<EngineTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPIEngineType>(request.serialize(), apiUrls.engineType, 'Engine Type').pipe(
      map((response: IAPIEngineType) => EngineTypeModel.deserialize(response)),
      tapWithAction((engineType: EngineTypeModel) => {
        this.engineTypes = Utilities.updateArray<EngineTypeModel>(this.engineTypes, engineType, {
          replace: !isNewRequest,
          predicate: t => t.id === engineType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getRangeUOMs(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.rangeUOM, this.rangeUOMs, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(rangeUOM => (this.rangeUOMs = rangeUOM))
    );
  }

  /* istanbul ignore next */
  public upsertRangeUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRangeUOM: boolean = request.id === 0;
    return this.upsert(request, apiUrls.rangeUOM, 'Range UOM').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((rangeUOM: SettingsTypeModel) => {
        this.rangeUOMs = Utilities.updateArray<SettingsTypeModel>(this.rangeUOMs, rangeUOM, {
          replace: !isNewRangeUOM,
          predicate: t => t.id === rangeUOM.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getWeightUOMs(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.weightUOM, this.weightUOMs, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(weightUOM => (this.weightUOMs = weightUOM))
    );
  }

  /* istanbul ignore next */
  public upsertWeightUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewWeightUOM: boolean = request.id === 0;
    return this.upsert(request, apiUrls.weightUOM, 'Weight UOM').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((weightUOM: SettingsTypeModel) => {
        this.weightUOMs = Utilities.updateArray<SettingsTypeModel>(this.weightUOMs, weightUOM, {
          replace: !isNewWeightUOM,
          predicate: t => t.id === weightUOM.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAircraftModifications(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.aircraftModification,
      this.aircraftModifications,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(aircraftModiications => (this.aircraftModifications = aircraftModiications)));
  }

  /* istanbul ignore next */
  public upsertAircraftModification(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.aircraftModification, 'Aircraft Modification').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((aircraftModification: SettingsTypeModel) => {
        this.aircraftModifications = Utilities.updateArray<SettingsTypeModel>(
          this.aircraftModifications,
          aircraftModification,
          {
            replace: !isAddRequest,
            predicate: t => t.id === aircraftModification.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getFlightPlanFormatStatus(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.flightPlanFormatStatus,
      this.flightPlanFormatStatus,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(flightPlanFormatStatus => (this.flightPlanFormatStatus = flightPlanFormatStatus)));
  }

  /* istanbul ignore next */
  public upsertFlightPlanFormatStatus(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.flightPlanFormatStatus, 'Flight Plan Format Status').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((flightPlanFormatStatus: SettingsTypeModel) => {
        this.flightPlanFormatStatus = Utilities.updateArray<SettingsTypeModel>(
          this.flightPlanFormatStatus,
          flightPlanFormatStatus,
          {
            replace: !isAddRequest,
            predicate: t => t.id === flightPlanFormatStatus.id,
          }
        );
      })
    );
  }
  /* istanbul ignore next */
  public getSubCategories(forceRefresh?: boolean): Observable<SubCategoryModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.subCategory, this.subCategories, forceRefresh, SubCategoryModel.deserializeList, {
      params,
    }).pipe(tapWithAction(subCategories => (this.subCategories = subCategories)));
  }

  /* istanbul ignore next */
  public upsertSubCategory(request: SubCategoryModel): Observable<SubCategoryModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert<IAPISubCategory>(request.serialize(), apiUrls.subCategory, 'Sub Category').pipe(
      map((response: IAPISubCategory) => SubCategoryModel.deserialize(response)),
      tapWithAction((subCategory: SubCategoryModel) => {
        this.subCategories = Utilities.updateArray<SubCategoryModel>(this.subCategories, subCategory, {
          replace: !isNewRequest,
          predicate: t => t.id === subCategory.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAircraftColors(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.aircraftColor, this.aircraftColors, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(aircraftColors => (this.aircraftColors = aircraftColors)));
  }

  /* istanbul ignore next */
  public upsertAircraftColor(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.aircraftColor, 'Aircraft Color').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((aircraftColor: SettingsTypeModel) => {
        this.aircraftColors = Utilities.updateArray<SettingsTypeModel>(this.aircraftColors, aircraftColor, {
          replace: !isAddRequest,
          predicate: t => t.id === aircraftColor.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAirframeStatus(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.airframeStatus,
      this.airframeStatus,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(airframeStatus => (this.airframeStatus = airframeStatus)));
  }

  /* istanbul ignore next */
  public upsertAirframeStatus(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.airframeStatus, 'Airframe Status').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((airframeStatus: SettingsTypeModel) => {
        this.airframeStatus = Utilities.updateArray<SettingsTypeModel>(this.airframeStatus, airframeStatus, {
          replace: !isAddRequest,
          predicate: t => t.id === airframeStatus.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getWindUOMs(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.windUOM, this.windUOMs, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(windUOMs => (this.windUOMs = windUOMs))
    );
  }

  /* istanbul ignore next */
  public upsertWindUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.windUOM, 'Wind UOM').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((windUOM: SettingsTypeModel) => {
        this.windUOMs = Utilities.updateArray<SettingsTypeModel>(this.windUOMs, windUOM, {
          replace: !isAddRequest,
          predicate: t => t.id === windUOM.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFuelReservePolicies(forceRefresh?: boolean): Observable<FuelReservePolicyModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'PolicyNumber', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.fuelReservePolicy,
      this.fuelReservePolicies,
      forceRefresh,
      FuelReservePolicyModel.deserializeList,
      { params }
    ).pipe(tapWithAction(fuelReservePolicies => (this.fuelReservePolicies = fuelReservePolicies)));
  }

  /* istanbul ignore next */
  public upsertFuelReservePolicy(request: FuelReservePolicyModel): Observable<FuelReservePolicyModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.fuelReservePolicy, 'Fuel Reserve Policy').pipe(
      map(response => FuelReservePolicyModel.deserialize(response)),
      tapWithAction((fuelReservePolicy: FuelReservePolicyModel) => {
        this.fuelReservePolicies = Utilities.updateArray<FuelReservePolicyModel>(
          this.fuelReservePolicies,
          fuelReservePolicy,
          {
            replace: !isAddRequest,
            predicate: t => t.id === fuelReservePolicy.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getStcManufactures(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.stcManufacture,
      this.stcManufactures,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(stcManufactures => (this.stcManufactures = stcManufactures)));
  }

  /* istanbul ignore next */
  public upsertStcManufacture(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.stcManufacture, 'STC Manufacture').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((stcManufacture: SettingsTypeModel) => {
        this.stcManufactures = Utilities.updateArray<SettingsTypeModel>(this.stcManufactures, stcManufacture, {
          replace: !isNewRequest,
          predicate: t => t.id === stcManufacture.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getAircraftNoiseTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.aircraftNoiseType,
      this.aircraftNoiseTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(aircraftNoiseTypes => (this.aircraftNoiseTypes = aircraftNoiseTypes)));
  }

  /* istanbul ignore next */
  public upsertAircraftNoiseType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.aircraftNoiseType, 'Aircraft Noise Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((aircraftNoiseType: SettingsTypeModel) => {
        this.aircraftNoiseTypes = Utilities.updateArray<SettingsTypeModel>(this.aircraftNoiseTypes, aircraftNoiseType, {
          replace: !isNewRequest,
          predicate: t => t.id === aircraftNoiseType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getNoiseDateTypeCertifications(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.noiseDateTypeCertification,
      this.noiseDateTypeCertifications,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(
      tapWithAction(noiseDateTypeCertifications => (this.noiseDateTypeCertifications = noiseDateTypeCertifications))
    );
  }

  /* istanbul ignore next */
  public upsertNoiseDateTypeCertification(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.noiseDateTypeCertification, 'Noise Date Type Certification').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((noiseDateTypeCertification: SettingsTypeModel) => {
        this.noiseDateTypeCertifications = Utilities.updateArray<SettingsTypeModel>(
          this.noiseDateTypeCertifications,
          noiseDateTypeCertification,
          {
            replace: !isNewRequest,
            predicate: t => t.id === noiseDateTypeCertification.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getAcases(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.acas, this.acases, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(acases => (this.acases = acases))
    );
  }

  /* istanbul ignore next */
  public upsertAcas(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.acas, 'ACAS').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((acas: SettingsTypeModel) => {
        this.acases = Utilities.updateArray<SettingsTypeModel>(this.acases, acas, {
          replace: !isNewRequest,
          predicate: t => t.id === acas.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getNoiseChapterConfigurations(forceRefresh?: boolean): Observable<NoiseChapterConfigurationModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'noisechapter.name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.noiseChapterConfiguration,
      this.noiseChapterConfigurations,
      forceRefresh,
      NoiseChapterConfigurationModel.deserializeList,
      { params }
    ).pipe(tapWithAction(noiseChapterConfigurations => (this.noiseChapterConfigurations = noiseChapterConfigurations)));
  }

  /* istanbul ignore next */
  public upsertNoiseChapterConfiguration(
    request: NoiseChapterConfigurationModel
  ): Observable<NoiseChapterConfigurationModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.noiseChapterConfiguration, 'Noise Chapter Configuration').pipe(
      map((response: IAPINoiseChapterConfiguration) => NoiseChapterConfigurationModel.deserialize(response)),
      tapWithAction((noiseChapterConfigurations: NoiseChapterConfigurationModel) => {
        this.noiseChapterConfigurations = Utilities.updateArray<NoiseChapterConfigurationModel>(
          this.noiseChapterConfigurations,
          noiseChapterConfigurations,
          {
            replace: !isNewRequest,
            predicate: t => t.id === noiseChapterConfigurations.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getRadios(forceRefresh?: boolean): Observable<RegistrySequenceBaseModel[]> {
    return this.getResult(apiUrls.radio, this.radios, forceRefresh, RegistrySequenceBaseModel.deserializeList).pipe(
      tapWithAction(radios => (this.radios = radios))
    );
  }

  /* istanbul ignore next */
  public upsertRadio(request: RegistrySequenceBaseModel): Observable<RegistrySequenceBaseModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.radio, 'Radio').pipe(
      map(response => RegistrySequenceBaseModel.deserialize(response)),
      tapWithAction((radio: RegistrySequenceBaseModel) => {
        this.radios = Utilities.updateArray<RegistrySequenceBaseModel>(this.radios, radio, {
          replace: !isNewRequest,
          predicate: t => t.id === radio.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTransponders(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return this.getResult(apiUrls.transponder, this.transponders, forceRefresh, IdNameCodeModel.deserializeList).pipe(
      tapWithAction(transponders => (this.transponders = transponders))
    );
  }

  /* istanbul ignore next */
  public upsertTransponder(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.transponder, 'Transponder').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((transponder: IdNameCodeModel) => {
        this.transponders = Utilities.updateArray<IdNameCodeModel>(this.transponders, transponder, {
          replace: !isAddRequest,
          predicate: t => t.id === transponder.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getMilitaryDesignations(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.militaryDesignation,
      this.militaryDesignations,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(militaryDesignations => (this.militaryDesignations = militaryDesignations)));
  }

  /* istanbul ignore next */
  public upsertMilitaryDesignation(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.militaryDesignation, 'Military Designation').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((militaryDesignation: SettingsTypeModel) => {
        this.militaryDesignations = Utilities.updateArray<SettingsTypeModel>(
          this.militaryDesignations,
          militaryDesignation,
          {
            replace: !isNewRequest,
            predicate: t => t.id === militaryDesignation.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getNavBlueRegistries(forceRefresh?: boolean): Observable<NavBlueGenericRegistryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.NAV_BLUE_GENERIC_REGISTRY,
    });
    if (this.navBlueGenericRegistries?.length && !forceRefresh) {
      return of(this.navBlueGenericRegistries);
    }
    return http.get<IAPIPageResponse<IAPINavBlueGenericRegistry>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => NavBlueGenericRegistryModel.deserializeList(response.results)),
      tapWithAction(response => (this.navBlueGenericRegistries = response))
    );
  }

  /* istanbul ignore next */
  public getOtherNames(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.otherName, this.otherNames, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(otherNames => (this.otherNames = otherNames)));
  }

  /* istanbul ignore next */
  public upsertOtherName(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.otherName, 'Other Name').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((otherName: SettingsTypeModel) => {
        this.otherNames = Utilities.updateArray<SettingsTypeModel>(this.otherNames, otherName, {
          replace: !isNewRequest,
          predicate: t => t.id === otherName.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getWakeTurbulenceGroups(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.wakeTurbulenceGroup,
      this.wakeTurbulenceGroups,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(wakeTurbulenceGroups => (this.wakeTurbulenceGroups = wakeTurbulenceGroups)));
  }

  /* istanbul ignore next */
  public upsertWakeTurbulenceGroup(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.wakeTurbulenceGroup, 'Wake Turbulence Group').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((wakeTurbulenceGroup: SettingsTypeModel) => {
        this.wakeTurbulenceGroups = Utilities.updateArray<SettingsTypeModel>(
          this.wakeTurbulenceGroups,
          wakeTurbulenceGroup,
          {
            replace: !isNewRequest,
            predicate: t => t.id === wakeTurbulenceGroup.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getPopularNames(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.popularName, this.popularNames, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tapWithAction(popularNames => (this.popularNames = popularNames)));
  }

  /* istanbul ignore next */
  public upsertPopularName(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.popularName, 'Popular Name').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((popularName: SettingsTypeModel) => {
        this.popularNames = Utilities.updateArray<SettingsTypeModel>(this.popularNames, popularName, {
          replace: !isNewRequest,
          predicate: t => t.id === popularName.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getPropulsionType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(
      apiUrls.propulsionType,
      this.propulsionType,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { params }
    ).pipe(tapWithAction(propulsionType => (this.propulsionType = propulsionType)));
  }

  /* istanbul ignore next */
  public upsertPropulsionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.propulsionType, 'Propulsion Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((propulsionType: SettingsTypeModel) => {
        this.propulsionType = Utilities.updateArray<SettingsTypeModel>(this.propulsionType, propulsionType, {
          replace: !isNewRequest,
          predicate: t => t.id === propulsionType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFlightPlanningServiceTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.flightPlanningServiceType,
      this.flightPlanningServiceTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(serviceTypes => (this.flightPlanningServiceTypes = serviceTypes)));
  }

  /* istanbul ignore next */
  public upsertFlightPlanningServiceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.flightPlanningServiceType, 'Flight Planning Service Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((type: SettingsTypeModel) => {
        this.flightPlanningServiceTypes = Utilities.updateArray<SettingsTypeModel>(
          this.flightPlanningServiceTypes,
          type,
          {
            replace: !isNewRequest,
            predicate: t => t.id === type.id,
          }
        );
      })
    );
  }

  public getRunwayAnalysisType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.runwayAnalysisType,
      this.runwayAnalysisType,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(runwayAnalysisType => (this.runwayAnalysisType = runwayAnalysisType)));
  }

  /* istanbul ignore next */
  public upsertRunwayAnalysisType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.runwayAnalysisType, 'Runway Analysis').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((type: SettingsTypeModel) => {
        this.runwayAnalysisType = Utilities.updateArray<SettingsTypeModel>(this.runwayAnalysisType, type, {
          replace: !isNewRequest,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  public getDeliveryPackageType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.deliveryPackageType,
      this.deliveryPackageType,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(deliveryPackageType => (this.deliveryPackageType = deliveryPackageType)));
  }

  /* istanbul ignore next */
  public upsertDeliveryPackageType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.deliveryPackageType, 'Delivery Package').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((type: SettingsTypeModel) => {
        this.deliveryPackageType = Utilities.updateArray<SettingsTypeModel>(this.deliveryPackageType, type, {
          replace: !isNewRequest,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  public getUplinkVendor(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.uplinkVendor,
      this.uplinkVendor,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(uplinkVendor => (this.uplinkVendor = uplinkVendor)));
  }

  /* istanbul ignore next */
  public upsertUplinkVendor(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.uplinkVendor, 'Uplink Vendor').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((type: SettingsTypeModel) => {
        this.uplinkVendor = Utilities.updateArray<SettingsTypeModel>(this.uplinkVendor, type, {
          replace: !isNewRequest,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  public getCateringHeatingElement(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.cateringHeatingElement,
      this.cateringHeatingElement,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(cateringHeatingElement => (this.cateringHeatingElement = cateringHeatingElement)));
  }

  /* istanbul ignore next */
  public upsertCateringHeatingElement(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.cateringHeatingElement, 'Catering Heating Element').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((type: SettingsTypeModel) => {
        this.cateringHeatingElement = Utilities.updateArray<SettingsTypeModel>(this.cateringHeatingElement, type, {
          replace: !isNewRequest,
          predicate: t => t.id === type.id,
        });
      })
    );
  }

  public getOuterMainGearWheelSpan(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.outerMainGearWheelSpan,
      this.deliveryPackageType,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(outerMainGearWheelSpan => (this.outerMainGearWheelSpan = outerMainGearWheelSpan)));
  }

  /* istanbul ignore next */
  public upsertOuterMainGearWheelSpan(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.outerMainGearWheelSpan, 'Outer Main Gear Wheel Span').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((type: SettingsTypeModel) => {
        this.outerMainGearWheelSpan = Utilities.updateArray<SettingsTypeModel>(this.outerMainGearWheelSpan, type, {
          replace: !isNewRequest,
          predicate: t => t.id === type.id,
        });
      })
    );
  }
}
