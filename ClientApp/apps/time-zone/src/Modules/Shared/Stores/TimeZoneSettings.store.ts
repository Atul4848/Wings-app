import { baseApiPath, SettingsBaseStore, NO_SQL_COLLECTIONS } from '@wings/shared';
import { Utilities, tapWithAction, SettingsTypeModel } from '@wings-shared/core';
import { map } from 'rxjs/operators';
import { apiUrls } from './API.url';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { UAOfficesModel, WorldAwareModel, EventFrequencyModel } from '../Models';
import { IAPIUAOffices, IAPIWorldAware } from '../Interfaces';

export class TimeZoneSettingsStore extends SettingsBaseStore {
  @observable public worldEventTypes: SettingsTypeModel[] = [];
  @observable public worldAwares: WorldAwareModel[] = [];
  @observable public uaOffices: UAOfficesModel[] = [];
  @observable public worldEventCategories: SettingsTypeModel[] = [];
  @observable public worldEventFrequencies: EventFrequencyModel[] = [];
  @observable public worldEventSpecialConsiderations: SettingsTypeModel[] = [];
  @observable public supplierTypes: SettingsTypeModel[] = [];
  @observable public serviceLevels: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.timezones);
  }

  /* istanbul ignore next */
  public getWorldEventTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.worldEventType,
      this.worldEventTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(worldEventTypes => (this.worldEventTypes = worldEventTypes)));
  }

  /* istanbul ignore next */
  public upsertWorldEventTypes(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddWorldEventType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.worldEventType, 'World Event Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((worldEventTypes: SettingsTypeModel) => {
        this.worldEventTypes = Utilities.updateArray<SettingsTypeModel>(this.worldEventTypes, worldEventTypes, {
          replace: !isAddWorldEventType,
          predicate: t => t.id === worldEventTypes.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getWorldAwares(forceRefresh?: boolean): Observable<WorldAwareModel[]> {
    return this.getResult(apiUrls.worldAware, this.worldAwares, forceRefresh, WorldAwareModel.deserializeList).pipe(
      tapWithAction(worldAwares => (this.worldAwares = worldAwares))
    );
  }

  /* istanbul ignore next */
  public upsertWorldAware(request: WorldAwareModel): Observable<WorldAwareModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.worldAware, 'World Aware').pipe(
      map((response: IAPIWorldAware) => WorldAwareModel.deserialize(response)),
      tapWithAction((worldAware: WorldAwareModel) => {
        this.worldAwares = Utilities.updateArray<WorldAwareModel>(this.worldAwares, worldAware, {
          replace: !isNewRequest,
          predicate: t => t.id === worldAware.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public loadUAOffices(forceRefresh?: boolean): Observable<UAOfficesModel[]> {
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.UA_OFFICE,
      sortCollection: JSON.stringify([{ propertyName: 'uaOfficeId', isAscending: false }]),
    });
    return this.getResult(
      `${apiUrls.referenceData}?${params}`,
      this.uaOffices,
      forceRefresh,
      UAOfficesModel.deserializeList,
      {
        baseUrl: baseApiPath.noSqlData,
      }
    ).pipe(tapWithAction(uaOffices => (this.uaOffices = uaOffices)));
  }

  /* istanbul ignore next */
  public upsertUAOffices(request: UAOfficesModel): Observable<UAOfficesModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.uaOffices, 'UA Offices').pipe(
      map((response: IAPIUAOffices) => UAOfficesModel.deserialize(response)),
      tapWithAction((uaOffices: UAOfficesModel) => {
        this.uaOffices = Utilities.updateArray<UAOfficesModel>(this.uaOffices, uaOffices, {
          replace: !isNewRequest,
          predicate: t => t.id === uaOffices.id,
        });
      })
    );
  }

  public getWorldEventCategory(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.worldEventCategory,
      this.worldEventCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(tapWithAction(worldEventCategories => (this.worldEventCategories = worldEventCategories)));
  }

  /* istanbul ignore next */
  public upsertWorldEventCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddWorldEventCategory: boolean = request.id === 0;
    return this.upsert(request, apiUrls.worldEventCategory, 'World Event Category').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((worldEventCategories: SettingsTypeModel) => {
        this.worldEventCategories = Utilities.updateArray<SettingsTypeModel>(
          this.worldEventCategories,
          worldEventCategories,
          {
            replace: !isAddWorldEventCategory,
            predicate: t => t.id === worldEventCategories.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getWorldEventFrequency(forceRefresh?: boolean): Observable<EventFrequencyModel[]> {
    return this.getResult(
      apiUrls.worldEventFrequency,
      this.worldEventFrequencies,
      forceRefresh,
      EventFrequencyModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(tapWithAction(worldEventFrequencies => (this.worldEventFrequencies = worldEventFrequencies)));
  }

  /* istanbul ignore next */
  public getWorldEventSpecialConsiderations(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.worldEventSpecialConsideration,
      this.worldEventSpecialConsiderations,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(
      tapWithAction(
        worldEventSpecialConsiderations => (this.worldEventSpecialConsiderations = worldEventSpecialConsiderations)
      )
    );
  }

  /* istanbul ignore next */
  public upsertWorldEventSpecialConsideration(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddWorldEventSpecialConsideration: boolean = request.id === 0;
    return this.upsert(request, apiUrls.worldEventSpecialConsideration, 'Special Consideration').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((worldEventSpecialConsiderations: SettingsTypeModel) => {
        this.worldEventSpecialConsiderations = Utilities.updateArray<SettingsTypeModel>(
          this.worldEventSpecialConsiderations,
          worldEventSpecialConsiderations,
          {
            replace: !isAddWorldEventSpecialConsideration,
            predicate: t => t.id === worldEventSpecialConsiderations.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getSupplierTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.supplierType, this.supplierTypes, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
      idKey: 'supplierTypeId',
    }).pipe(tapWithAction(supplierTypes => (this.supplierTypes = supplierTypes)));
  }

  /* istanbul ignore next */
  public upsertSupplierType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddSupplierType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.supplierType, 'Supplier Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((supplierType: SettingsTypeModel) => {
        this.supplierTypes = Utilities.updateArray<SettingsTypeModel>(this.supplierTypes, supplierType, {
          replace: !isAddSupplierType,
          predicate: t => t.id === supplierType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getServiceLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.serviceLevel, this.serviceLevels, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
      idKey: 'serviceLevelId',
    }).pipe(tapWithAction(serviceLevel => (this.serviceLevels = serviceLevel)));
  }

  /* istanbul ignore next */
  public upsertServiceLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNew: boolean = request.id === 0;
    return this.upsert(request, apiUrls.serviceLevel, 'Service Level').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((serviceLevel: SettingsTypeModel) => {
        this.serviceLevels = Utilities.updateArray<SettingsTypeModel>(this.serviceLevels, serviceLevel, {
          replace: !isAddNew,
          predicate: t => t.id === serviceLevel.id,
        });
      })
    );
  }
}
