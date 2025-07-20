import { PermitSettingsStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { FARTypeModel } from '@wings/shared';
import { PermitValidityModel, RuleEntityParameterConfigModel } from '../Models';
import { tap } from 'rxjs/operators';
import { PERMIT_RULE_SOURCES } from '../Enums';
import { Utilities, tapWithAction, SettingsTypeModel } from '@wings-shared/core';

export class PermitSettingsStoreMock extends PermitSettingsStore {
  public getAccessLevels(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((accessLevels: SettingsTypeModel[]) => {
        this.accessLevels = accessLevels;
      })
    );
  }

  public upsertAccessLevel(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((accessLevel: SettingsTypeModel) => {
        this.accessLevels = Utilities.updateArray<SettingsTypeModel>(this.accessLevels, accessLevel, {
          replace: false,
          predicate: t => t.id === accessLevel.id,
        });
      })
    );
  }

  public getSourceTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((sourceTypes: SettingsTypeModel[]) => {
        this.sourceTypes = sourceTypes;
      })
    );
  }

  public upsertSourceType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((sourceType: SettingsTypeModel) => {
        this.sourceTypes = Utilities.updateArray<SettingsTypeModel>(this.sourceTypes, sourceType, {
          replace: false,
          predicate: t => t.id === sourceType.id,
        });
      })
    );
  }

  public getPermitAppliedTo(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((permitAppliedTo: SettingsTypeModel[]) => {
        this.permitAppliedTo = permitAppliedTo;
      })
    );
  }

  public upsertPermitAppliedTo(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((permitApplyTo: SettingsTypeModel) => {
        this.permitAppliedTo = Utilities.updateArray<SettingsTypeModel>(this.permitAppliedTo, permitApplyTo, {
          replace: true,
          predicate: t => t.id === permitApplyTo.id,
        });
      })
    );
  }

  public getPermitTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((permitTypes: SettingsTypeModel[]) => {
        this.permitTypes = permitTypes;
      })
    );
  }

  public upsertPermitType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((permitType: SettingsTypeModel) => {
        this.permitTypes = Utilities.updateArray<SettingsTypeModel>(this.permitTypes, permitType, {
          replace: true,
          predicate: t => t.id === permitType.id,
        });
      })
    );
  }

  public getFARTypes(forceRefresh?: boolean): Observable<FARTypeModel[]> {
    return of([ new FARTypeModel(), new FARTypeModel() ]).pipe(
      tapWithAction((farTypes: FARTypeModel[]) => {
        this.farTypes = farTypes;
      })
    );
  }

  public upsertFARType(request: FARTypeModel): Observable<FARTypeModel> {
    return of(new FARTypeModel()).pipe(
      tapWithAction((farType: FARTypeModel) => {
        this.farTypes = Utilities.updateArray<FARTypeModel>(this.farTypes, farType, {
          replace: true,
          predicate: t => t.id === farType.id,
        });
      })
    );
  }

  public getRuleConditionalOperators(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((ruleConditionalOperators: SettingsTypeModel[]) => {
        this.ruleConditionalOperators = ruleConditionalOperators;
      })
    );
  }

  public upsertRuleConditionalOperators(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((ruleConditionalOperators: SettingsTypeModel) => {
        this.ruleConditionalOperators = Utilities.updateArray<SettingsTypeModel>(
          this.ruleConditionalOperators,
          ruleConditionalOperators,
          {
            replace: false,
            predicate: t => t.id === ruleConditionalOperators.id,
          }
        );
      })
    );
  }

  public getFlightPurposes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((flightPurposes: SettingsTypeModel[]) => {
        this.flightPurposes = flightPurposes;
      })
    );
  }

  public upsertFlightPurpose(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((flightPurpose: SettingsTypeModel) => {
        this.flightPurposes = Utilities.updateArray<SettingsTypeModel>(this.flightPurposes, flightPurpose, {
          replace: false,
          predicate: t => t.id === flightPurpose.id,
        });
      })
    );
  }

  public getRuleEntities(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((ruleEntities: SettingsTypeModel[]) => {
        this.ruleEntities = ruleEntities;
      })
    );
  }

  public upsertRuleEntities(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((ruleEntities: SettingsTypeModel) => {
        this.ruleEntities = Utilities.updateArray<SettingsTypeModel>(this.ruleEntities, ruleEntities, {
          replace: false,
          predicate: t => t.id === ruleEntities.id,
        });
      })
    );
  }

  public getRuleEntityParameterConfigs(forceRefresh?: boolean): Observable<RuleEntityParameterConfigModel[]> {
    return of([
      new RuleEntityParameterConfigModel({
        id: 15,
        ruleEntityType: new SettingsTypeModel({ name: 'Country' }),
        entityParameter: 'ArrivalCountry',
        apiSource: PERMIT_RULE_SOURCES.Country,
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'IN' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'TRIP' }),
        entityParameter: 'ArrivalAirport',
        apiSource: PERMIT_RULE_SOURCES.Airport,
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'NotEqual' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'TRIP' }),
        entityParameter: 'FAR-TYPE',
        apiSource: PERMIT_RULE_SOURCES.FARType,
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'Equal' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'TRIP' }),
        entityParameter: 'PurposeOfFlight',
        isDropDown: true,
        apiSource: PERMIT_RULE_SOURCES.PurposeOfFlight,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'Contains' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'Aircraft' }),
        entityParameter: 'NoiseStage',
        apiSource: PERMIT_RULE_SOURCES.NoiseChapter,
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'Equal' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'TRIP' }),
        entityParameter: 'AirportOfEntry',
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'Equal' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'TRIP' }),
        entityParameter: 'FlightLevelInCountry',
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'Equal' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'TRIP' }),
        apiSource: PERMIT_RULE_SOURCES.Region,
        entityParameter: 'Region',
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'Equal' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'TRIP' }),
        apiSource: PERMIT_RULE_SOURCES.State,
        entityParameter: 'ArrivalState',
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'NotEqualTo' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'Aircraft' }),
        apiSource: PERMIT_RULE_SOURCES.AircraftCategory,
        entityParameter: 'AircraftCategory',
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'StartsWith' }) ],
      }),
      new RuleEntityParameterConfigModel({
        ruleEntityType: new SettingsTypeModel({ name: 'Aircraft' }),
        apiSource: PERMIT_RULE_SOURCES.ICAOAerodromeReferenceCode,
        entityParameter: 'ICAOAerodromeReferenceCode',
        isDropDown: true,
        supportedOperators: [ new SettingsTypeModel({ id: 1, name: 'EndsWith' }) ],
      }),
    ]).pipe(
      tapWithAction((ruleEntityParameterConfigs: RuleEntityParameterConfigModel[]) => {
        this.ruleEntityParameterConfigs = ruleEntityParameterConfigs;
      })
    );
  }

  public getNoiseChapters(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((noiseChapters: SettingsTypeModel[]) => {
        this.noiseChapters = noiseChapters;
      })
    );
  }

  public getPermitRequirementTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((permitRequirementTypes: SettingsTypeModel[]) => {
        this.permitRequirementTypes = permitRequirementTypes;
      })
    );
  }

  public upsertPermitRequirementType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((permitRequirementType: SettingsTypeModel) => {
        this.permitRequirementTypes = Utilities.updateArray<SettingsTypeModel>(
          this.permitRequirementTypes,
          permitRequirementType,
          {
            replace: true,
            predicate: t => t.id === permitRequirementType.id,
          }
        );
      })
    );
  }

  public getFlightOperationalCategories(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((flightOperationalCategories: SettingsTypeModel[]) => {
        this.flightOperationalCategories = flightOperationalCategories;
      })
    );
  }

  public upsertFlightOperationalCategory(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((flightOperationalCategory: SettingsTypeModel) => {
        this.flightOperationalCategories = Utilities.updateArray<SettingsTypeModel>(
          this.flightOperationalCategories,
          flightOperationalCategory,
          {
            replace: true,
            predicate: t => t.id === flightOperationalCategory.id,
          }
        );
      })
    );
  }

  public getTimeLevelsUOM(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((timeLevelsUOM: SettingsTypeModel[]) => {
        this.timeLevelsUOM = timeLevelsUOM;
      })
    );
  }

  public upsertTimeLevelUOM(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((timeLevelUOM: SettingsTypeModel) => {
        this.timeLevelsUOM = Utilities.updateArray<SettingsTypeModel>(this.timeLevelsUOM, timeLevelUOM, {
          replace: true,
          predicate: t => t.id === timeLevelUOM.id,
        });
      })
    );
  }

  public getLeadTimeTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((leadTimeTypes: SettingsTypeModel[]) => {
        this.leadTimeTypes = leadTimeTypes;
      })
    );
  }

  public upsertLeadTimeType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((leadTimeType: SettingsTypeModel) => {
        this.leadTimeTypes = Utilities.updateArray<SettingsTypeModel>(this.leadTimeTypes, leadTimeType, {
          replace: true,
          predicate: t => t.id === leadTimeType.id,
        });
      })
    );
  }

  public getPermitValidity(permitId: number, forceRefresh?: boolean): Observable<PermitValidityModel[]> {
    return of([ new PermitValidityModel(), new PermitValidityModel() ]).pipe(
      tapWithAction((permitValidity: PermitValidityModel[]) => {
        this.permitValidity = permitValidity;
      })
    );
  }

  public upsertPermitValidity(request: PermitValidityModel): Observable<PermitValidityModel> {
    return of(new PermitValidityModel()).pipe(
      tapWithAction((permitValidity: PermitValidityModel) => {
        this.permitValidity = Utilities.updateArray<PermitValidityModel>(this.permitValidity, permitValidity, {
          replace: true,
          predicate: t => t.id === permitValidity.id,
        });
      })
    );
  }

  public getpermitPrerequisiteTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((permitPrerequisiteTypes: SettingsTypeModel[]) => {
        this.permitPrerequisiteTypes = permitPrerequisiteTypes;
      })
    );
  }

  public upsertpermitPrerequisiteType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((permitPrerequisiteType: SettingsTypeModel) => {
        this.permitPrerequisiteTypes = Utilities.updateArray<SettingsTypeModel>(
          this.permitPrerequisiteTypes,
          permitPrerequisiteType,
          {
            replace: true,
            predicate: t => t.id === permitPrerequisiteType.id,
          }
        );
      })
    );
  }
  public getBlanketValidityTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((blanketValidityTypes: SettingsTypeModel[]) => {
        this.blanketValidityTypes = blanketValidityTypes;
      })
    );
  }

  public upsertBlanketValidityType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((blanketValidityType: SettingsTypeModel) => {
        this.blanketValidityTypes = Utilities.updateArray<SettingsTypeModel>(
          this.blanketValidityTypes,
          blanketValidityType,
          {
            replace: true,
            predicate: t => t.id === blanketValidityType.id,
          }
        );
      })
    );
  }

  public getPermitDiplomaticTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((permitDiplomaticTypes: SettingsTypeModel[]) => {
        this.permitDiplomaticTypes = permitDiplomaticTypes;
      })
    );
  }

  public upsertPermitDiplomaticType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((permitDiplomaticType: SettingsTypeModel) => {
        this.permitDiplomaticTypes = Utilities.updateArray<SettingsTypeModel>(
          this.permitDiplomaticTypes,
          permitDiplomaticType,
          {
            replace: true,
            predicate: t => t.id === permitDiplomaticType.id,
          }
        );
      })
    );
  }

  public getPermitNumberExceptions(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((permitNumberExceptions: SettingsTypeModel[]) => {
        this.permitNumberExceptions = permitNumberExceptions;
      })
    );
  }

  public upsertPermitNumberException(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((permitNumberException: SettingsTypeModel) => {
        this.permitNumberExceptions = Utilities.updateArray<SettingsTypeModel>(
          this.permitNumberExceptions,
          permitNumberException,
          {
            replace: true,
            predicate: t => t.id === permitNumberException.id,
          }
        );
      })
    );
  }

  public getPermitClassifications(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tapWithAction((classifications: SettingsTypeModel[]) => {
        this.permitClassifications = classifications;
      })
    );
  }

  public upsertPermitClassification(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tapWithAction((classification: SettingsTypeModel) => {
        this.permitClassifications = Utilities.updateArray<SettingsTypeModel>(
          this.permitClassifications,
          classification,
          {
            replace: true,
            predicate: t => t.id === classification.id,
          }
        );
      })
    );
  }
}
