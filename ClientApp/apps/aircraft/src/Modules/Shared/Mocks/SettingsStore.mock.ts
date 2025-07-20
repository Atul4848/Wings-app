import { SettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { CountryModel } from '@wings/shared';
import { tap } from 'rxjs/operators';
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
} from '../Models';
import { IAPIGridRequest, IAPIPageResponse, Utilities, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';

export class SettingsStoreMock extends SettingsStore {
  constructor() {
    super();
    this.navBlueGenericRegistries = [
      new NavBlueGenericRegistryModel({ weightUOMName: 'KGS' }),
      new NavBlueGenericRegistryModel({ weightUOMName: 'LBS' }),
    ];
  }

  public getRegistryIdentifierCountries(): Observable<RegistryIdentifierCountryModel[]> {
    return of([ new RegistryIdentifierCountryModel() ]).pipe(
      tap(registryIdentifierCountries => (this.registryIdentifierCountries = registryIdentifierCountries))
    );
  }

  public getAircraftModels(): Observable<AircraftModel[]> {
    return of([ new AircraftModel() ]).pipe(tap(aircraftModels => (this.aircraftModels = aircraftModels)));
  }

  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> {
    const results: CountryModel[] = [ new CountryModel(), new CountryModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tap(response => (this.countries = response.results))
    );
  }

  public getMakes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((makes: SettingsTypeModel[]) => (this.makes = makes))
    );
  }

  public upsertMake(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel({ id: 1, name: 'makes' })).pipe(
      tap((makes: SettingsTypeModel) => {
        this.makes = Utilities.updateArray<SettingsTypeModel>(this.makes, makes, {
          replace: true,
          predicate: t => t.id === makes.id,
        });
      })
    );
  }

  public upsertRegistryIdentifierCountry(
    request: RegistryIdentifierCountryModel
  ): Observable<RegistryIdentifierCountryModel> {
    return of(new RegistryIdentifierCountryModel());
  }

  public getICAOTypeDesignators(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((icaoTypeDesignators: SettingsTypeModel[]) => (this.icaoTypeDesignators = icaoTypeDesignators))
    );
  }

  public upsertICAOTypeDesignator(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'ICAO' })).pipe(
      tap((icaoTypeDesignator: SettingsTypeModel) => {
        this.icaoTypeDesignators = Utilities.updateArray<SettingsTypeModel>(
          this.icaoTypeDesignators,
          icaoTypeDesignator,
          {
            replace: true,
            predicate: t => t.id === icaoTypeDesignator.id,
          }
        );
      })
    );
  }

  public getWakeTurbulenceCategories(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((wakeTurbulenceCategories: SettingsTypeModel[]) => (this.wakeTurbulenceCategories = wakeTurbulenceCategories))
    );
  }

  public upsertWakeTurbulenceCategory(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'Turbulence' })).pipe(
      tap((wakeTurbulenceCategory: SettingsTypeModel) => {
        this.wakeTurbulenceCategories = Utilities.updateArray<SettingsTypeModel>(
          this.wakeTurbulenceCategories,
          wakeTurbulenceCategory,
          {
            replace: true,
            predicate: t => t.id === wakeTurbulenceCategory.id,
          }
        );
      })
    );
  }

  public getAerodromeRefCodes(): Observable<AerodromeRefCodeModel[]> {
    return of([ new AerodromeRefCodeModel(), new AerodromeRefCodeModel() ]).pipe(
      tap((aerodromeRefCodes: AerodromeRefCodeModel[]) => (this.aerodromeRefCodes = aerodromeRefCodes))
    );
  }

  public upsertAerodromeRefCode(request: AerodromeRefCodeModel) {
    return of(new AerodromeRefCodeModel({ id: 1, name: 'Aerodrome' })).pipe(
      tap((aerodromeRefCode: AerodromeRefCodeModel) => {
        this.aerodromeRefCodes = Utilities.updateArray<AerodromeRefCodeModel>(
          this.aerodromeRefCodes,
          aerodromeRefCode,
          {
            replace: true,
            predicate: t => t.id === aerodromeRefCode.id,
          }
        );
      })
    );
  }

  public getCategories(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((categories: SettingsTypeModel[]) => (this.categories = categories))
    );
  }

  public upsertCategory(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'Category' })).pipe(
      tap((category: SettingsTypeModel) => {
        this.categories = Utilities.updateArray<SettingsTypeModel>(this.categories, category, {
          replace: true,
          predicate: t => t.id === category.id,
        });
      })
    );
  }

  public getDistanceUOMs(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((distanceUOMs: SettingsTypeModel[]) => (this.distanceUOMs = distanceUOMs))
    );
  }

  public upsertDistanceUOM(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'DistanceUOM' })).pipe(
      tap((distanceUOM: SettingsTypeModel) => {
        this.distanceUOMs = Utilities.updateArray<SettingsTypeModel>(this.distanceUOMs, distanceUOM, {
          replace: true,
          predicate: t => t.id === distanceUOM.id,
        });
      })
    );
  }

  public upsertAircraftModel(request: AircraftModel): Observable<AircraftModel> {
    return of(new AircraftModel());
  }

  public getFuelTypeProfile(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((fuelTypeProfile: SettingsTypeModel[]) => (this.fuelTypeProfile = fuelTypeProfile))
    );
  }

  public upsertFuelTypeProfile(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'Fuel' })).pipe(
      tap((fuelTypeProfile: SettingsTypeModel) => {
        this.fuelTypeProfile = Utilities.updateArray<SettingsTypeModel>(this.fuelTypeProfile, fuelTypeProfile, {
          replace: true,
          predicate: t => t.id === fuelTypeProfile.id,
        });
      })
    );
  }

  public getFireCategory(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((fireCategories: SettingsTypeModel[]) => (this.fireCategories = fireCategories))
    );
  }

  public upsertFireCategory(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'Fuel' })).pipe(
      tap((fireCategories: SettingsTypeModel) => {
        this.fireCategories = Utilities.updateArray<SettingsTypeModel>(this.fireCategories, fireCategories, {
          replace: true,
          predicate: t => t.id === fireCategories.id,
        });
      })
    );
  }

  public getRangeUOMs(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((rangeUOMs: SettingsTypeModel[]) => (this.rangeUOMs = rangeUOMs))
    );
  }

  public upsertRangeUOM(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'range' })).pipe(
      tap((rangeUOMs: SettingsTypeModel) => {
        this.rangeUOMs = Utilities.updateArray<SettingsTypeModel>(this.rangeUOMs, rangeUOMs, {
          replace: true,
          predicate: t => t.id === rangeUOMs.id,
        });
      })
    );
  }

  public getWeightUOMs(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((weightUOMs: SettingsTypeModel[]) => (this.weightUOMs = weightUOMs))
    );
  }

  public upsertWeightUOM(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'weight' })).pipe(
      tap((weightUOMs: SettingsTypeModel) => {
        this.weightUOMs = Utilities.updateArray<SettingsTypeModel>(this.weightUOMs, weightUOMs, {
          replace: true,
          predicate: t => t.id === weightUOMs.id,
        });
      })
    );
  }

  public getNoiseChapters(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((noiseChapters: SettingsTypeModel[]) => (this.noiseChapters = noiseChapters))
    );
  }

  public upsertNoiseChapter(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'noise' })).pipe(
      tap((noiseChapters: SettingsTypeModel) => {
        this.noiseChapters = Utilities.updateArray<SettingsTypeModel>(this.noiseChapters, noiseChapters, {
          replace: true,
          predicate: t => t.id === noiseChapters.id,
        });
      })
    );
  }

  public getSeries(): Observable<SeriesModel[]> {
    return of([ new SeriesModel(), new SeriesModel() ]).pipe(tap(series => (this.series = series)));
  }

  public upsertSeries(request: SeriesModel): Observable<SeriesModel> {
    return of(new SeriesModel());
  }

  public getEngineTypes(): Observable<EngineTypeModel[]> {
    return of([ new EngineTypeModel() ]).pipe(tap(engineTypes => (this.engineTypes = engineTypes)));
  }

  public upsertEngineType(request: EngineTypeModel): Observable<EngineTypeModel> {
    return of(new EngineTypeModel());
  }

  public getAircraftModifications(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((aircraftVariations: SettingsTypeModel[]) => (this.aircraftModifications = aircraftVariations))
    );
  }

  public upsertAircraftModification(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1, name: 'variation' })).pipe(
      tap((aircraftVariations: SettingsTypeModel) => {
        this.aircraftModifications = Utilities.updateArray<SettingsTypeModel>(
          this.aircraftModifications,
          aircraftVariations,
          {
            replace: true,
            predicate: t => t.id === aircraftVariations.id,
          }
        );
      })
    );
  }

  public getFlightPlanFormatStatus(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((flightPlanFormatStatus: SettingsTypeModel[]) => (this.flightPlanFormatStatus = flightPlanFormatStatus))
    );
  }

  public upsertFlightPlanFormatStatus(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getSubCategories(): Observable<SubCategoryModel[]> {
    return of([ new SubCategoryModel() ]).pipe(
      tap((subCategories: SubCategoryModel[]) => (this.subCategories = subCategories))
    );
  }

  public upsertSubCategory(request: SubCategoryModel): Observable<SubCategoryModel> {
    return of(new SubCategoryModel()).pipe(
      tap((subCategory: SubCategoryModel) => {
        this.subCategories = Utilities.updateArray<SubCategoryModel>(this.subCategories, subCategory, {
          replace: true,
          predicate: t => t.id === subCategory.id,
        });
      })
    );
  }

  public getAircraftColors(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((aircraftColors: SettingsTypeModel[]) => (this.aircraftColors = aircraftColors))
    );
  }

  public upsertAircraftColor(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getAirframeStatus(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((airframeStatus: SettingsTypeModel[]) => (this.airframeStatus = airframeStatus))
    );
  }

  public upsertAirframeStatus(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getWindUOMs(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((windUOMs: SettingsTypeModel[]) => (this.windUOMs = windUOMs))
    );
  }

  public upsertWindUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getFuelReservePolicies(forceRefresh?: boolean): Observable<FuelReservePolicyModel[]> {
    return of([ new FuelReservePolicyModel(), new FuelReservePolicyModel() ]).pipe(
      tap((fuelReservePolicies: FuelReservePolicyModel[]) => (this.fuelReservePolicies = fuelReservePolicies))
    );
  }

  public upsertFuelReservePolicy(request: FuelReservePolicyModel): Observable<FuelReservePolicyModel> {
    return of(new FuelReservePolicyModel());
  }

  public getSourceTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((sourceTypes: SettingsTypeModel[]) => (this.sourceTypes = sourceTypes))
    );
  }

  public upsertSourceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getAccessLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((accessLevels: SettingsTypeModel[]) => (this.accessLevels = accessLevels))
    );
  }

  public upsertAccessLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }

  public getStcManufactures(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((mods: SettingsTypeModel[]) => (this.stcManufactures = mods))
    );
  }

  public upsertStcManufacture(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1 }));
  }

  public getAircraftNoiseTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((aircraftNoiseTypes: SettingsTypeModel[]) => (this.aircraftNoiseTypes = aircraftNoiseTypes))
    );
  }

  public upsertAircraftNoiseType(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1 }));
  }

  public getNoiseDateTypeCertifications(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap(
        (noiseDateTypeCertifications: SettingsTypeModel[]) =>
          (this.noiseDateTypeCertifications = noiseDateTypeCertifications)
      )
    );
  }

  public upsertNoiseDateTypeCertification(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1 }));
  }

  public getAcases(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((acases: SettingsTypeModel[]) => (this.acases = acases))
    );
  }

  public upsertAcas(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1 }));
  }

  public getNoiseChapterConfigurations(): Observable<NoiseChapterConfigurationModel[]> {
    return of([ new NoiseChapterConfigurationModel(), new NoiseChapterConfigurationModel() ]).pipe(
      tap(
        (noiseChapterConfigurations: NoiseChapterConfigurationModel[]) =>
          (this.noiseChapterConfigurations = noiseChapterConfigurations)
      )
    );
  }

  public upsertNoiseChapterConfiguration(request: NoiseChapterConfigurationModel) {
    return of(new NoiseChapterConfigurationModel({ id: 1 }));
  }

  public getRadios(): Observable<RegistrySequenceBaseModel[]> {
    return of([ new RegistrySequenceBaseModel(), new RegistrySequenceBaseModel() ]).pipe(
      tap((radios: RegistrySequenceBaseModel[]) => (this.radios = radios))
    );
  }

  public upsertRadio(request: RegistrySequenceBaseModel): Observable<RegistrySequenceBaseModel> {
    return of(new RegistrySequenceBaseModel({ id: 1, name: 'Radio' })).pipe(
      tap((radio: RegistrySequenceBaseModel) => {
        this.radios = Utilities.updateArray<RegistrySequenceBaseModel>(this.radios, radio, {
          replace: true,
          predicate: t => t.id === radio.id,
        });
      })
    );
  }

  public getTransponders(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return of([ new IdNameCodeModel(), new IdNameCodeModel() ]).pipe(
      tap((transponders: IdNameCodeModel[]) => {
        this.transponders = transponders;
      })
    );
  }

  public upsertTransponder(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    return of(new IdNameCodeModel()).pipe(
      tap((transponder: IdNameCodeModel) => {
        this.transponders = Utilities.updateArray<IdNameCodeModel>(this.transponders, transponder, {
          replace: true,
          predicate: t => t.id === transponder.id,
        });
      })
    );
  }

  public getMilitaryDesignations(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((militaryDesignations: SettingsTypeModel[]) => (this.militaryDesignations = militaryDesignations))
    );
  }

  public upsertMilitaryDesignation(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel({ id: 1, name: 'Military Designation' })).pipe(
      tap((militaryDesignation: SettingsTypeModel) => {
        this.militaryDesignations = Utilities.updateArray<SettingsTypeModel>(
          this.militaryDesignations,
          militaryDesignation,
          {
            replace: true,
            predicate: t => t.id === militaryDesignation.id,
          }
        );
      })
    );
  }

  public getNavBlueRegistries(forceRefresh?: boolean): Observable<NavBlueGenericRegistryModel[]> {
    return of([ new NavBlueGenericRegistryModel() ]);
  }

  public getWakeTurbulenceGroups(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((wakeTurbulenceGroups: SettingsTypeModel[]) => (this.wakeTurbulenceGroups = wakeTurbulenceGroups))
    );
  }

  public upsertWakeTurbulenceGroup(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1 }));
  }

  public getPopularNames(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((wakeTurbulenceGroups: SettingsTypeModel[]) => (this.wakeTurbulenceGroups = wakeTurbulenceGroups))
    );
  }

  public upsertPopularName(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1 }));
  }

  public getFlightPlanningServiceTypes(): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((serviceTypes: SettingsTypeModel[]) => (this.flightPlanningServiceTypes = serviceTypes))
    );
  }

  public upsertFlightPlanningServiceType(request: SettingsTypeModel) {
    return of(new SettingsTypeModel({ id: 1 }));
  }
}
