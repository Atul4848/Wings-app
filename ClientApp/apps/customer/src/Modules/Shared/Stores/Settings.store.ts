import { Observable, of } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { observable } from 'mobx';
import {
  baseApiPath,
  CountryModel,
  HttpClient,
  IAPICountry,
  NO_SQL_COLLECTIONS,
  SettingsBaseStore,
} from '@wings/shared';
import {
  Utilities,
  SettingsTypeModel,
  tapWithAction,
  IAPIPageResponse,
  IAPIGridRequest,
  IdNameCodeModel,
} from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { apiUrls } from './API.url';
import { PassportNationalityModel, TeamModel } from '../Models';

export class SettingsStore extends SettingsBaseStore {
  @observable public serviceType: SettingsTypeModel[] = [];
  @observable public specialCareType: SettingsTypeModel[] = [];
  @observable public specialCareTypeLevel: SettingsTypeModel[] = [];
  @observable public contactMethod: SettingsTypeModel[] = [];
  @observable public contactType: SettingsTypeModel[] = [];
  @observable public communicationCategories: SettingsTypeModel[] = [];
  @observable public contactRole: SettingsTypeModel[] = [];
  @observable public communicationLevel: SettingsTypeModel[] = [];
  @observable public priority: SettingsTypeModel[] = [];
  @observable public noteTypes: SettingsTypeModel[] = [];
  @observable public passportNationality: PassportNationalityModel[] = [];
  @observable public countries: CountryModel[] = [];
  @observable public externalCustomermappingLevels: SettingsTypeModel[] = [];
  @observable public externalCustomerSources: SettingsTypeModel[] = [];
  @observable public teamUseType: SettingsTypeModel[] = [];
  @observable public teamType: SettingsTypeModel[] = [];
  @observable public profileTopic: SettingsTypeModel[] = [];
  @observable public profileLevel: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.customer);
  }

  /* istanbul ignore next */
  public getServiceType(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.serviceType, this.serviceType, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(serviceType => (this.serviceType = serviceType))
    );
  }

  /* istanbul ignore next */
  public upsertServiceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddServiceType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.serviceType, 'Service Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((serviceType: SettingsTypeModel) => {
        this.serviceType = Utilities.updateArray<SettingsTypeModel>(this.serviceType, serviceType, {
          replace: !isAddServiceType,
          predicate: t => t.id === serviceType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public removeServiceType(request: SettingsTypeModel): Observable<string> {
    const params = {
      serviceTypeId: request.id,
    };
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http.delete<string>(`${apiUrls.serviceType}`, params).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Service Type deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public getSpecialCareType(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.specialCareType,
      this.specialCareType,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(specialCareType => (this.specialCareType = specialCareType)));
  }

  /* istanbul ignore next */
  public upsertSpecialCareType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSpecialCareType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.specialCareType, 'Special Care Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((specialCareType: SettingsTypeModel) => {
        this.specialCareType = Utilities.updateArray<SettingsTypeModel>(this.specialCareType, specialCareType, {
          replace: !isAddSpecialCareType,
          predicate: t => t.id === specialCareType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getSpecialCareTypeLevel(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.specialCareTypeLevel,
      this.specialCareTypeLevel,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(specialCareTypeLevel => (this.specialCareTypeLevel = specialCareTypeLevel)));
  }

  /* istanbul ignore next */
  public upsertSpecialCareTypeLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSpecialCareTypeLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.specialCareTypeLevel, 'Special Care Type Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((specialCareTypeLevel: SettingsTypeModel) => {
        this.specialCareTypeLevel = Utilities.updateArray<SettingsTypeModel>(
          this.specialCareTypeLevel,
          specialCareTypeLevel,
          {
            replace: !isAddSpecialCareTypeLevel,
            predicate: t => t.id === specialCareTypeLevel.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getContactMethod(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.contactMethod,
      this.contactMethod,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(contactMethod => (this.contactMethod = contactMethod)));
  }

  /* istanbul ignore next */
  public upsertContactMethod(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddContactMethod: boolean = request.id === 0;
    return this.upsert(request, apiUrls.contactMethod, 'Contact Method').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((contactMethod: SettingsTypeModel) => {
        this.contactMethod = Utilities.updateArray<SettingsTypeModel>(this.contactMethod, contactMethod, {
          replace: !isAddContactMethod,
          predicate: t => t.id === contactMethod.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getContactType(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.contactType, this.contactType, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(contactType => (this.contactType = contactType))
    );
  }

  /* istanbul ignore next */
  public upsertContactType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddContactType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.contactType, 'Contact Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((contactType: SettingsTypeModel) => {
        this.contactType = Utilities.updateArray<SettingsTypeModel>(this.contactType, contactType, {
          replace: !isAddContactType,
          predicate: t => t.id === contactType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getCommunicationCategories(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.communicationCategory,
      this.communicationCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(communicationCategories => (this.communicationCategories = communicationCategories)));
  }

  /* istanbul ignore next */
  public upsertCommunicationCategories(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddCommunicationCategory: boolean = request.id === 0;
    return this.upsert(request, apiUrls.communicationCategory, 'Communication Categories').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((communicationCategory: SettingsTypeModel) => {
        this.communicationCategories = Utilities.updateArray<SettingsTypeModel>(
          this.communicationCategories,
          communicationCategory,
          {
            replace: !isAddCommunicationCategory,
            predicate: t => t.id === communicationCategory.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getContactRole(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.contactRole, this.contactRole, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(contactRole => (this.contactRole = contactRole))
    );
  }

  /* istanbul ignore next */
  public upsertContactRole(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddContactRole: boolean = request.id === 0;
    return this.upsert(request, apiUrls.contactRole, 'Contact Role').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((contactRole: SettingsTypeModel) => {
        this.contactRole = Utilities.updateArray<SettingsTypeModel>(this.contactRole, contactRole, {
          replace: !isAddContactRole,
          predicate: t => t.id === contactRole.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getCommunicationLevel(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.communicationLevel,
      this.communicationLevel,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(communicationLevel => (this.communicationLevel = communicationLevel)));
  }

  /* istanbul ignore next */
  public upsertCommunicationLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddCommunicationLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.communicationLevel, 'Contact Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((communicationLevel: SettingsTypeModel) => {
        this.communicationLevel = Utilities.updateArray<SettingsTypeModel>(
          this.communicationLevel,
          communicationLevel,
          {
            replace: !isAddCommunicationLevel,
            predicate: t => t.id === communicationLevel.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getPriority(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.priority, this.priority, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(priority => (this.priority = priority))
    );
  }

  /* istanbul ignore next */
  public upsertPriority(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewPriority: boolean = request.id === 0;
    return this.upsert(request, apiUrls.priority, 'Priority').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((priority: SettingsTypeModel) => {
        this.priority = Utilities.updateArray<SettingsTypeModel>(this.priority, priority, {
          replace: !isNewPriority,
          predicate: t => t.id === priority.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getNoteTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.noteType, this.noteTypes, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(noteTypes => (this.noteTypes = noteTypes))
    );
  }

  /* istanbul ignore next */
  public upsertNoteType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewNote: boolean = request.id === 0;
    return this.upsert(request, apiUrls.noteType, 'Note Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((note: SettingsTypeModel) => {
        this.noteTypes = Utilities.updateArray<SettingsTypeModel>(this.noteTypes, note, {
          replace: !isNewNote,
          predicate: t => t.id === note.id,
        });
      })
    );
  }

  public getPassportNationality(forceRefresh: boolean = false): Observable<PassportNationalityModel[]> {
    return this.getResult(
      apiUrls.passportNationality,
      this.passportNationality,
      forceRefresh,
      PassportNationalityModel.deserializeList
    ).pipe(tap(passportNationality => (this.passportNationality = passportNationality)));
  }

  /* istanbul ignore next */
  public upsertPassportNationality(request: PassportNationalityModel): Observable<PassportNationalityModel> {
    const isAddPassportNationality: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.passportNationality, 'Passport Nationality').pipe(
      map(response => PassportNationalityModel.deserialize(response)),
      tap((passportNationality: PassportNationalityModel) => {
        this.passportNationality = Utilities.updateArray<PassportNationalityModel>(
          this.passportNationality,
          passportNationality,
          {
            replace: !isAddPassportNationality,
            predicate: t => t.id === passportNationality.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public removePassportNationality(id: number): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http.delete<string>(`${apiUrls.passportNationality}/${id}`).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Passport Nationality deleted successfully!'))
    );
  }

  /* istanbul ignore next */
  public getCountries(request?: IAPIGridRequest): Observable<IAPIPageResponse<IdNameCodeModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const specifiedFields = [ 'CountryId', 'CommonName', 'ISO2Code' ];
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.COUNTRY,
      sortCollection: JSON.stringify([{ propertyName: 'CommonName', isAscending: true }]),
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPICountry>>(
        `${apiUrls.referenceData}?${params}${Utilities.getSpecifiedFieldParams(specifiedFields)}`
      )
      .pipe(
        Logger.observableCatchError,
        takeUntil(this.reset$),
        map(response => ({
          ...response,
          results: response.results.map(
            x =>
              new IdNameCodeModel({
                id: x.countryId,
                code: x.isO2Code,
                name: x.commonName,
              })
          ),
        })),
        tapWithAction(response => (this.countries = response.results))
      );
  }

  /* istanbul ignore next */
  public getExternalCustomermappingLevels(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.externalCustomerMappingLevel,
      this.externalCustomermappingLevels,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(levels => (this.externalCustomermappingLevels = levels)));
  }

  /* istanbul ignore next */
  public upsertExternalCustomermappingLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.externalCustomerMappingLevel, 'External Customer Mapping Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((level: SettingsTypeModel) => {
        this.externalCustomermappingLevels = Utilities.updateArray<SettingsTypeModel>(
          this.externalCustomermappingLevels,
          level,
          {
            replace: !isNewLevel,
            predicate: t => t.id === level.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getExternalCustomerSources(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.externalCustomerSource,
      this.externalCustomerSources,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(sources => (this.externalCustomerSources = sources)));
  }

  /* istanbul ignore next */
  public upsertExternalCustomerSource(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewAccount: boolean = request.id === 0;
    return this.upsert(request, apiUrls.externalCustomerSource, 'External Customer Source').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((source: SettingsTypeModel) => {
        this.externalCustomerSources = Utilities.updateArray<SettingsTypeModel>(this.externalCustomerSources, source, {
          replace: !isNewAccount,
          predicate: t => t.id === source.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTeamUseType(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.teamUseType, this.teamUseType, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(teamUseType => (this.teamUseType = teamUseType))
    );
  }

  /* istanbul ignore next */
  public upsertTeamUseType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.teamUseType, 'Team Use Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((teamUseType: SettingsTypeModel) => {
        this.teamUseType = Utilities.updateArray<SettingsTypeModel>(this.teamUseType, teamUseType, {
          replace: !isNewLevel,
          predicate: t => t.id === teamUseType.id,
        });
      })
    );
  }

  public getProfileTopic(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    const params: object = {
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };
    return this.getResult(apiUrls.profileTopic, this.profileTopic, forceRefresh, SettingsTypeModel.deserializeList, {
      params,
    }).pipe(tap(topics => (this.profileTopic = topics)));
  }

  /* istanbul ignore next */
  public upsertProfileTopic(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewAccount: boolean = request.id === 0;
    return this.upsert(request, apiUrls.profileTopic, 'Profile Topic').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((source: SettingsTypeModel) => {
        this.profileTopic = Utilities.updateArray<SettingsTypeModel>(this.profileTopic, source, {
          replace: !isNewAccount,
          predicate: t => t.id === source.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getTeamType(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.teamType, this.teamType, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tap(teamType => (this.teamType = teamType))
    );
  }

  /* istanbul ignore next */
  public upsertTeamType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewLevel: boolean = request.id === 0;
    return this.upsert(request, apiUrls.teamType, 'Team Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((teamType: SettingsTypeModel) => {
        this.teamType = Utilities.updateArray<SettingsTypeModel>(this.teamType, teamType, {
          replace: !isNewLevel,
          predicate: t => t.id === teamType.id,
        });
      })
    );
  }

  public getProfileLevel(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.profileLevel,
      this.profileLevel,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tap(level => (this.profileLevel = level)));
  }

  /* istanbul ignore next */
  public upsertProfileLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewAccount: boolean = request.id === 0;
    return this.upsert(request, apiUrls.profileLevel, 'Profile Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tap((source: SettingsTypeModel) => {
        this.profileLevel = Utilities.updateArray<SettingsTypeModel>(this.profileLevel, source, {
          replace: !isNewAccount,
          predicate: t => t.id === source.id,
        });
      })
    );
  }
}
