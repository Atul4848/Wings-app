import {
  baseApiPath,
  FARTypeModel,
  IAPIFARType,
  SettingsBaseStore,
  NO_SQL_COLLECTIONS,
  HttpClient,
} from '@wings/shared';
import { map, tap } from 'rxjs/operators';
import { apiUrls } from './API.url';
import { Observable } from 'rxjs';
import { observable } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { PermitValidityModel, RuleEntityParameterConfigModel, RuleFilterModel } from '../Models';
import { IAPILeadTimeType, IAPIPermitValidity } from '../Interfaces';
import { Logger } from '@wings-shared/security';
import { IdNameCodeModel, Utilities, tapWithAction, SettingsTypeModel } from '@wings-shared/core';

export class PermitSettingsStore extends SettingsBaseStore {
  @observable public permitAppliedTo: SettingsTypeModel[] = [];
  @observable public permitTypes: SettingsTypeModel[] = [];
  @observable public farTypes: FARTypeModel[] = [];
  @observable public ruleConditionalOperators: SettingsTypeModel[] = [];
  @observable public flightPurposes: SettingsTypeModel[] = [];
  @observable public ruleEntities: SettingsTypeModel[] = [];
  @observable public ruleEntityParameterConfigs: RuleEntityParameterConfigModel[] = [];
  @observable public noiseChapters: SettingsTypeModel[] = [];
  @observable public permitRequirementTypes: SettingsTypeModel[] = [];
  @observable public flightOperationalCategories: SettingsTypeModel[] = [];
  @observable public timeLevelsUOM: SettingsTypeModel[] = [];
  @observable public leadTimeTypes: SettingsTypeModel[] = [];
  @observable public permitValidity: PermitValidityModel[] = [];
  @observable public permitPrerequisiteTypes: SettingsTypeModel[] = [];
  @observable public blanketValidityTypes: SettingsTypeModel[] = [];
  @observable public permitDiplomaticTypes: SettingsTypeModel[] = [];
  @observable public permitNumberExceptions: SettingsTypeModel[] = [];
  @observable public elements: SettingsTypeModel[] = [];
  @observable public documents: IdNameCodeModel[] = [];
  @observable public missionElements: SettingsTypeModel[] = [];
  @observable public dataElements: SettingsTypeModel[] = [];
  @observable public crossingTypes: SettingsTypeModel[] = [];
  @observable public permitClassifications: SettingsTypeModel[] = [];
  @observable public presetValidities: SettingsTypeModel[] = [];
  @observable public rejectionReason: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.permits);
  }

  /* istanbul ignore next */
  public getPermitAppliedTo(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permitAppliedTo,
      this.permitAppliedTo,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(tapWithAction(permitAppliedTo => (this.permitAppliedTo = permitAppliedTo)));
  }

  /* istanbul ignore next */
  public upsertPermitAppliedTo(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddPermitAppliedTo: boolean = request.id === 0;
    return this.upsert(request, apiUrls.permitAppliedTo, 'Permit Applied To').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((permitApplyTo: SettingsTypeModel) => {
        this.permitAppliedTo = Utilities.updateArray<SettingsTypeModel>(this.permitAppliedTo, permitApplyTo, {
          replace: !isAddPermitAppliedTo,
          predicate: t => t.id === permitApplyTo.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getPermitTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.permitType, this.permitTypes, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction(permitTypes => (this.permitTypes = permitTypes)));
  }

  /* istanbul ignore next */
  public upsertPermitType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddPermitType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.permitType, 'Permit Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((permitType: SettingsTypeModel) => {
        this.permitTypes = Utilities.updateArray<SettingsTypeModel>(this.permitTypes, permitType, {
          replace: !isAddPermitType,
          predicate: t => t.id === permitType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getFARTypes(forceRefresh: boolean = false): Observable<FARTypeModel[]> {
    return this.getResult(apiUrls.farType, this.farTypes, forceRefresh, FARTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction((farTypes: FARTypeModel[]) => (this.farTypes = farTypes)));
  }

  /* istanbul ignore next */
  public upsertFARType(request: FARTypeModel): Observable<FARTypeModel> {
    const isAddFARType: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.farType, 'FAR Type').pipe(
      map((response: IAPIFARType) => FARTypeModel.deserialize(response)),
      tapWithAction((farType: FARTypeModel) => {
        this.farTypes = Utilities.updateArray<FARTypeModel>(this.farTypes, farType, {
          replace: !isAddFARType,
          predicate: t => t.id === farType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getRuleConditionalOperators(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.ruleConditionalOperator,
      this.ruleConditionalOperators,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(tapWithAction(ruleConditionalOperators => (this.ruleConditionalOperators = ruleConditionalOperators)));
  }

  /* istanbul ignore next */
  public upsertRuleConditionalOperators(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRecord: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ruleConditionalOperator, 'Rule Conditional Operator').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ruleConditionalOperators: SettingsTypeModel) => {
        this.flightPurposes = Utilities.updateArray<SettingsTypeModel>(
          this.ruleConditionalOperators,
          ruleConditionalOperators,
          {
            replace: !isNewRecord,
            predicate: t => t.id === ruleConditionalOperators.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getFlightPurposes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.purposeOfFlight,
      this.flightPurposes,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(tapWithAction(flightPurposes => (this.flightPurposes = flightPurposes)));
  }

  /* istanbul ignore next */
  public upsertFlightPurpose(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddFlightPurpose: boolean = request.id === 0;
    return this.upsert(request, apiUrls.purposeOfFlight, 'Flight Purpose').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((flightPurpose: SettingsTypeModel) => {
        this.flightPurposes = Utilities.updateArray<SettingsTypeModel>(this.flightPurposes, flightPurpose, {
          replace: !isAddFlightPurpose,
          predicate: t => t.id === flightPurpose.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getRuleEntities(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.ruleEntity, this.ruleEntities, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction(ruleEntities => (this.ruleEntities = ruleEntities)));
  }

  /* istanbul ignore next */
  public upsertRuleEntities(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRecord: boolean = request.id === 0;
    return this.upsert(request, apiUrls.ruleEntity, 'Rule Entities').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((ruleEntities: SettingsTypeModel) => {
        this.flightPurposes = Utilities.updateArray<SettingsTypeModel>(this.ruleEntities, ruleEntities, {
          replace: !isNewRecord,
          predicate: t => t.id === ruleEntities.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getRuleEntityParameterConfigs(forceRefresh: boolean = false): Observable<RuleEntityParameterConfigModel[]> {
    return this.getResult(
      apiUrls.ruleEntityParameterConfig,
      this.ruleEntityParameterConfigs,
      forceRefresh,
      RuleEntityParameterConfigModel.deserializeList,
      { sortKey: 'entityParameter' }
    ).pipe(tapWithAction(ruleEntityParameterConfigs => (this.ruleEntityParameterConfigs = ruleEntityParameterConfigs)));
  }

  /* istanbul ignore next */
  public getSelectedEntityParamConfig(ruleFilter: RuleFilterModel): RuleEntityParameterConfigModel {
    return this.ruleEntityParameterConfigs.find(
      ({ ruleEntityType, entityParameter }: RuleEntityParameterConfigModel) =>
        Utilities.isEqual(ruleEntityType.name, ruleFilter?.ruleEntityType?.name) &&
        Utilities.isEqual(entityParameter, ruleFilter?.ruleField?.name)
    ) as RuleEntityParameterConfigModel;
  }
  /* istanbul ignore next */
  public getNoiseChapters(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.noiseChapter, this.noiseChapters, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
      baseUrl: baseApiPath.aircraft,
    }).pipe(tapWithAction(noiseChapter => (this.noiseChapters = noiseChapter)));
  }

  /* istanbul ignore next */
  public getPermitRequirementTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permitRequirementType,
      this.permitRequirementTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(
      tapWithAction(
        (permitRequirementTypes: SettingsTypeModel[]) => (this.permitRequirementTypes = permitRequirementTypes)
      )
    );
  }

  /* istanbul ignore next */
  public upsertPermitRequirementType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddPermitRequirementType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.permitRequirementType, 'Permit Requirement Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((permitRequirementType: SettingsTypeModel) => {
        this.permitRequirementTypes = Utilities.updateArray<SettingsTypeModel>(
          this.permitRequirementTypes,
          permitRequirementType,
          {
            replace: !isAddPermitRequirementType,
            predicate: t => t.id === permitRequirementType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getFlightOperationalCategories(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.flightOperationalCategory,
      this.flightOperationalCategories,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(
      tapWithAction(
        (flightOperationalCategories: SettingsTypeModel[]) =>
          (this.flightOperationalCategories = flightOperationalCategories)
      )
    );
  }

  /* istanbul ignore next */
  public upsertFlightOperationalCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isFlightOperationalCategoryAdd: boolean = request.id === 0;
    return this.upsert(request, apiUrls.flightOperationalCategory, 'Flight Operational Category').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((flightOperationalCategory: SettingsTypeModel) => {
        this.flightOperationalCategories = Utilities.updateArray<SettingsTypeModel>(
          this.flightOperationalCategories,
          flightOperationalCategory,
          {
            replace: !isFlightOperationalCategoryAdd,
            predicate: t => t.id === flightOperationalCategory.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getTimeLevelsUOM(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.timeLevelUOM, this.timeLevelsUOM, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction((timeLevelsUOM: SettingsTypeModel[]) => (this.timeLevelsUOM = timeLevelsUOM)));
  }

  /* istanbul ignore next */
  public upsertTimeLevelUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddTimeLevelUOM: boolean = request.id === 0;
    return this.upsert(request, apiUrls.timeLevelUOM, 'Time Level UOM').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((timeLevelUOM: SettingsTypeModel) => {
        this.timeLevelsUOM = Utilities.updateArray<SettingsTypeModel>(this.timeLevelsUOM, timeLevelUOM, {
          replace: !isAddTimeLevelUOM,
          predicate: t => t.id === timeLevelUOM.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getLeadTimeTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    const params: object = {
      collectionName: NO_SQL_COLLECTIONS.LEAD_TIME_TYPE,
      pageSize: 0,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
    };

    // map response
    const deserializeList = (response: IAPILeadTimeType[]) => {
      return response ? response.map(model => new SettingsTypeModel({ ...model, id: model.leadTimeTypeId })) : [];
    };

    return this.getResult(apiUrls.referenceData, this.leadTimeTypes, forceRefresh, deserializeList, {
      params,
      baseUrl: baseApiPath.noSqlData,
    }).pipe(tapWithAction(leadTimeTypes => (this.leadTimeTypes = leadTimeTypes)));
  }

  /* istanbul ignore next */
  public upsertLeadTimeType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.leadTimeType, 'Lead Time Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((leadTimeType: SettingsTypeModel) => {
        this.leadTimeTypes = Utilities.updateArray<SettingsTypeModel>(this.leadTimeTypes, leadTimeType, {
          replace: !isNewRequest,
          predicate: t => t.id === leadTimeType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getPermitValidity(permitId: number, forceRefresh: boolean = false): Observable<PermitValidityModel[]> {
    const params: object = {
      pageSize: 0,
      ...Utilities.filters({ permitId }),
    };

    // map response
    const deserializeList = (response: IAPIPermitValidity[]) => {
      return response ? response.map(model => PermitValidityModel.deserialize(model)) : [];
    };

    return this.getResult(apiUrls.permitValidity, this.permitValidity, forceRefresh, deserializeList, {
      params,
      baseUrl: baseApiPath.permits,
    }).pipe(tapWithAction(permitValidity => (this.permitValidity = permitValidity)));
  }

  /* istanbul ignore next */
  public upsertPermitValidity(request: PermitValidityModel): Observable<PermitValidityModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.permitValidity, 'Permit Validity').pipe(
      map((response: IAPIPermitValidity) => PermitValidityModel.deserialize(response)),
      tapWithAction((permitValidity: PermitValidityModel) => {
        this.permitValidity = Utilities.updateArray<PermitValidityModel>(this.permitValidity, permitValidity, {
          replace: !isNewRequest,
          predicate: t => t.id === permitValidity.id,
        });
      })
    );
  }
  /* istanbul ignore next */
  public removePermitValidity({ id }: PermitValidityModel): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.permits });
    return http
      .delete<string>(apiUrls.permitValidity, { permitValidityId: id })
      .pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Permit Validity deleted successfully!'))
      );
  }

  /* istanbul ignore next */
  public getpermitPrerequisiteTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permitPrerequisiteType,
      this.permitPrerequisiteTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(permitPrerequisiteTypes => (this.permitPrerequisiteTypes = permitPrerequisiteTypes)));
  }

  /* istanbul ignore next */
  public upsertpermitPrerequisiteType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.permitPrerequisiteType, 'Permit Prerequisite Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((permitPrerequisiteType: SettingsTypeModel) => {
        this.permitPrerequisiteTypes = Utilities.updateArray<SettingsTypeModel>(
          this.permitPrerequisiteTypes,
          permitPrerequisiteType,
          {
            replace: !isNewRequest,
            predicate: t => t.id === permitPrerequisiteType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getBlanketValidityTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.blanketValidityType,
      this.blanketValidityTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(blanketValidityTypes => (this.blanketValidityTypes = blanketValidityTypes)));
  }

  /* istanbul ignore next */
  public upsertBlanketValidityType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.blanketValidityType, 'Blanket Validity Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((blanketValidityType: SettingsTypeModel) => {
        this.blanketValidityTypes = Utilities.updateArray<SettingsTypeModel>(
          this.blanketValidityTypes,
          blanketValidityType,
          {
            replace: !isNewRequest,
            predicate: t => t.id === blanketValidityType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getPermitDiplomaticTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permitDiplomaticType,
      this.permitDiplomaticTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(permitDiplomaticTypes => (this.permitDiplomaticTypes = permitDiplomaticTypes)));
  }

  /* istanbul ignore next */
  public upsertPermitDiplomaticType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.permitDiplomaticType, 'Permit Diplomatic Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((permitDiplomaticType: SettingsTypeModel) => {
        this.permitDiplomaticTypes = Utilities.updateArray<SettingsTypeModel>(
          this.permitDiplomaticTypes,
          permitDiplomaticType,
          {
            replace: !isNewRequest,
            predicate: t => t.id === permitDiplomaticType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getPermitNumberExceptions(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permitNumberException,
      this.permitNumberExceptions,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(permitNumberExceptions => (this.permitNumberExceptions = permitNumberExceptions)));
  }

  /* istanbul ignore next */
  public upsertPermitNumberException(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.permitNumberException, 'Permit Number Exception').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((permitNumberException: SettingsTypeModel) => {
        this.permitNumberExceptions = Utilities.updateArray<SettingsTypeModel>(
          this.permitNumberExceptions,
          permitNumberException,
          {
            replace: !isNewRequest,
            predicate: t => t.id === permitNumberException.id,
          }
        );
      })
    );
  }

  public getElements(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.element, this.elements, forceRefresh, SettingsTypeModel.deserializeList).pipe(
      tapWithAction(elements => (this.elements = elements))
    );
  }

  /* istanbul ignore next */
  public upsertElements(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.element, 'Element').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((element: SettingsTypeModel) => {
        this.elements = Utilities.updateArray<SettingsTypeModel>(this.elements, element, {
          replace: !isNewRequest,
          predicate: t => t.id === element.id,
        });
      })
    );
  }

  public getDocuments(forceRefresh: boolean = false): Observable<IdNameCodeModel[]> {
    return this.getResult(
      apiUrls.document,
      this.documents,
      forceRefresh as boolean,
      IdNameCodeModel.deserializeList
    ).pipe(tapWithAction(documents => (this.documents = documents)));
  }

  /* istanbul ignore next */
  public upsertDocuments(request: IdNameCodeModel): Observable<IdNameCodeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request.serialize(), apiUrls.document, 'Document').pipe(
      map(response => IdNameCodeModel.deserialize(response)),
      tapWithAction((document: IdNameCodeModel) => {
        this.documents = Utilities.updateArray<IdNameCodeModel>(this.documents, document, {
          replace: !isNewRequest,
          predicate: t => t.id === document.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getMissionElement(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.missionElement,
      this.missionElements,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        sortKey: 'name',
      }
    ).pipe(tapWithAction((missionElements: SettingsTypeModel[]) => (this.missionElements = missionElements)));
  }

  /* istanbul ignore next */
  public upsertMissionElement(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddMissionElement: boolean = request.id === 0;
    return this.upsert(request, apiUrls.missionElement, 'Mission Element').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((missionElement: SettingsTypeModel) => {
        this.missionElements = Utilities.updateArray<SettingsTypeModel>(this.missionElements, missionElement, {
          replace: !isAddMissionElement,
          predicate: t => t.id === missionElement.id,
        });
      })
    );
  }
  /* istanbul ignore next */
  public getDataElement(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.dataElement, this.dataElements, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction((dataElements: SettingsTypeModel[]) => (this.dataElements = dataElements)));
  }

  /* istanbul ignore next */
  public upsertDataElement(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddDataElement: boolean = request.id === 0;
    return this.upsert(request, apiUrls.dataElement, 'Data Element').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((dataElement: SettingsTypeModel) => {
        this.dataElements = Utilities.updateArray<SettingsTypeModel>(this.dataElements, dataElement, {
          replace: !isAddDataElement,
          predicate: t => t.id === dataElement.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getCrossingType(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(apiUrls.crossingType, this.crossingTypes, forceRefresh, SettingsTypeModel.deserializeList, {
      sortKey: 'name',
    }).pipe(tapWithAction((crossingTypes: SettingsTypeModel[]) => (this.crossingTypes = crossingTypes)));
  }

  /* istanbul ignore next */
  public upsertCrossingType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddCrossingType: boolean = request.id === 0;
    return this.upsert(request, apiUrls.crossingType, 'Crossing Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((crossingType: SettingsTypeModel) => {
        this.crossingTypes = Utilities.updateArray<SettingsTypeModel>(this.crossingTypes, crossingType, {
          replace: !isAddCrossingType,
          predicate: t => t.id === crossingType.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getPermitClassifications(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.permitClassification,
      this.permitClassifications,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      {
        sortKey: 'name',
      }
    ).pipe(tapWithAction((classifications: SettingsTypeModel[]) => (this.permitClassifications = classifications)));
  }

  /* istanbul ignore next */
  public upsertPermitClassification(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddNew: boolean = request.id === 0;
    return this.upsert(request, apiUrls.permitClassification, 'Permit Classification').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((classification: SettingsTypeModel) => {
        this.permitClassifications = Utilities.updateArray<SettingsTypeModel>(
          this.permitClassifications,
          classification,
          {
            replace: !isAddNew,
            predicate: t => t.id === classification.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public loadRejectionReason(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.rejectionReason,
      this.rejectionReason,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction(rejectionReason => (this.rejectionReason = rejectionReason)));
  }

  /* istanbul ignore next */
  public upsertRejectionReason(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isNewRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.rejectionReason, 'Rejection Reason').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((response: SettingsTypeModel) => {
        this.rejectionReason = Utilities.updateArray<SettingsTypeModel>(this.rejectionReason, response, {
          replace: !isNewRequest,
          predicate: t => t.id === response.id,
        });
      })
    );
  }

  /* istanbul ignore next */
  public getPresetValidities(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.presetValidity,
      this.presetValidities,
      forceRefresh,
      SettingsTypeModel.deserializeList,
      { sortKey: 'name' }
    ).pipe(
      tapWithAction(
        (presetValidities: SettingsTypeModel[]) =>
          (this.presetValidities = presetValidities)
      )
    );
  }

  /* istanbul ignore next */
  public upsertPresetValidity(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isPresetValidityNew: boolean = request.id === 0;
    return this.upsert(request, apiUrls.presetValidity, 'Preset Validity').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((presetValidity: SettingsTypeModel) => {
        this.presetValidities = Utilities.updateArray<SettingsTypeModel>(
          this.presetValidities,
          presetValidity,
          {
            replace: !isPresetValidityNew,
            predicate: t => t.id === presetValidity.id,
          }
        );
      })
    );
  }
}
