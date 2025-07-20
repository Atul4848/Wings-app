import { CountryModel, FileMock, StateModel, AirportModel } from '@wings/shared';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EntryFormRequirementModel, EntryRequirementModel, HealthAuthModel, GeneralInfoModel } from '../Models';
import { HealthAuthStore } from '../Stores';
import {
  IAPIGridRequest,
  IAPIPageResponse,
  Utilities,
  tapWithAction,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';
export class HealthAuthStoreMock extends HealthAuthStore {
  public getHealthAuths(forceRefresh?: boolean): Observable<IAPIPageResponse<HealthAuthModel>> {
    const results: HealthAuthModel[] = [ this.getHealthAuthTemplate(), new HealthAuthModel() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tap(response => (this.healthAuths = response.results))
    );
  }

  public getHealthAuthById(request?: IAPIGridRequest): Observable<IAPIPageResponse<HealthAuthModel>> {
    const results: HealthAuthModel[] = [ this.getHealthAuthTemplate() ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results });
  }

  public upsertHealthAuth(request: HealthAuthModel): Observable<HealthAuthModel> {
    return of(new HealthAuthModel());
  }

  public getAffectedTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel() ]).pipe(tapWithAction(affectedTypes => (this.affectedTypes = affectedTypes)));
  }

  public getAuthorizationLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel() ]).pipe(
      tapWithAction(authorizationLevels => (this.authorizationLevels = authorizationLevels))
    );
  }

  public getInfectionTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel() ]).pipe(
      tapWithAction(infectionTypes => {
        this.infectionTypes = infectionTypes;
      })
    );
  }

  public getQuarantineLocations(forceRefresh?: boolean): Observable<IdNameCodeModel[]> {
    return of([ new IdNameCodeModel() ]).pipe(
      tapWithAction(quarantineLocations => (this.quarantineLocations = quarantineLocations))
    );
  }

  public getCountries(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<CountryModel[]> {
    return of([ new CountryModel(), new CountryModel() ]).pipe(tap(response => (this.countries = response)));
  }

  public getStates(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<StateModel[]> {
    return of([ new StateModel(), new StateModel() ]).pipe(tap(response => (this.states = response)));
  }

  public getRegions(request?: IAPIGridRequest, forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(tap(response => (this.regions = response)));
  }

  public setInitialHealthauthData(): void {
    this.countries = [ new CountryModel(), new CountryModel() ];
    this.states = [ new StateModel(), new StateModel() ];
    this.wingsAirports = [ new AirportModel(), new AirportModel() ];
    this.healthAuths = [ new HealthAuthModel(), new HealthAuthModel() ];
  }

  public upsertAffectedType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((affectedType: SettingsTypeModel) => {
        this.affectedTypes = Utilities.updateArray<SettingsTypeModel>(this.affectedTypes, affectedType, {
          replace: true,
          predicate: t => t.id === affectedType.id,
        });
      })
    );
  }

  public upsertAuthorizationLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((authorizationLevel: SettingsTypeModel) => {
        this.authorizationLevels = Utilities.updateArray<SettingsTypeModel>(
          this.authorizationLevels,
          authorizationLevel,
          {
            replace: true,
            predicate: t => t.id === authorizationLevel.id,
          }
        );
      })
    );
  }

  public upsertInfectionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((infectionType: SettingsTypeModel) => {
        this.infectionTypes = Utilities.updateArray<SettingsTypeModel>(this.infectionTypes, infectionType, {
          replace: true,
          predicate: t => t.id === infectionType.id,
        });
      })
    );
  }

  private getHealthAuthTemplate(): HealthAuthModel {
    return new HealthAuthModel({
      id: 1,
      authorizationLevel: new SettingsTypeModel({ id: 1, name: 'Country' }),
      affectedType: new SettingsTypeModel({ id: 1, name: 'Nationality' }),
      infectionType: new SettingsTypeModel({ id: 1 }),
      levelDesignator: new IdNameCodeModel({ id: 1 }),
      isAllNationalities: false,
      isAllTraveledCountries: false,
      healthAuthNationalities: [ new CountryModel({ id: 1 }) ],
      healthAuthTraveledCountries: [ new CountryModel({ id: 1 }) ],
      crewEntryRequirement: new EntryRequirementModel({
        paxCrew: new SettingsTypeModel({ id: 2 }),
        formRequirements: [ new EntryFormRequirementModel() ],
      }),
      passengerEntryRequirement: new EntryRequirementModel({
        paxCrew: new SettingsTypeModel({ id: 1 }),
        formRequirements: [ new EntryFormRequirementModel() ],
      }),
    });
  }

  public getWingsAirport(searchValue: string): Observable<AirportModel[]> {
    return of([ new AirportModel(), new AirportModel() ]).pipe(tap(response => (this.wingsAirports = response)));
  }

  public validateUnique(): Observable<{ isValid: boolean }> {
    return of({ isValid: true });
  }

  public upsertQuarantineLocation(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    return of(new IdNameCodeModel());
  }

  public upsertGeneralInformation(request: HealthAuthModel): Observable<GeneralInfoModel> {
    return of(new GeneralInfoModel());
  }

  public getHealthAuthExcelFile(): Observable<File> {
    return of(new FileMock().testFile);
  }
}
