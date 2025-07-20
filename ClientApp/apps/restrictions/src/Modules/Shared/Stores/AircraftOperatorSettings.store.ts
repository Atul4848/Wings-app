import { SettingsBaseStore, baseApiPath } from '@wings/shared';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { observable } from 'mobx';
import { Utilities, tapWithAction, SettingsTypeModel } from '@wings-shared/core';

export class AircraftOperatorSettings extends SettingsBaseStore {
  @observable public aircraftOperatorRestrictionTypes: SettingsTypeModel[] = [];
  @observable public effectedEntityTypes: SettingsTypeModel[] = [];
  @observable public enforcementAgencies: SettingsTypeModel[] = [];
  @observable public restrictionSeverities: SettingsTypeModel[] = [];
  @observable public approvalTypesRequired: SettingsTypeModel[] = [];
  @observable public restrictionForms: SettingsTypeModel[] = [];

  constructor() {
    super(baseApiPath.restrictions);
  }

  /* istanbul ignore next */
  public getAircraftOperatorRestrictionTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.aircraftOperatorRestrictionType,
      this.aircraftOperatorRestrictionTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction(
        (aircraftOperatorRestrictionTypes: SettingsTypeModel[]) =>
          (this.aircraftOperatorRestrictionTypes = aircraftOperatorRestrictionTypes)
      )
    );
  }

  /* istanbul ignore next */
  public upsertAircraftOperatorRestrictionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(
      request.serializeSummary(),
      apiUrls.aircraftOperatorRestrictionType,
      'Aircraft Operator Restriction Type'
    ).pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((aircraftOperatorRestrictionType: SettingsTypeModel) => {
        this.aircraftOperatorRestrictionTypes = Utilities.updateArray<SettingsTypeModel>(
          this.aircraftOperatorRestrictionTypes,
          aircraftOperatorRestrictionType,
          {
            replace: !isAddRequest,
            predicate: t => t.id === aircraftOperatorRestrictionType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getEffectedEntityTypes(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.effectedEntityType,
      this.effectedEntityTypes,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction((effectedEntityTypes: SettingsTypeModel[]) => (this.effectedEntityTypes = effectedEntityTypes))
    );
  }

  /* istanbul ignore next */
  public upsertEffectedEntityType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.effectedEntityType, 'Effected Entity Type').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((effectedEntityType: SettingsTypeModel) => {
        this.effectedEntityTypes = Utilities.updateArray<SettingsTypeModel>(
          this.effectedEntityTypes,
          effectedEntityType,
          {
            replace: !isAddRequest,
            predicate: t => t.id === effectedEntityType.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getEnforcementAgencies(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.enforcementAgency,
      this.enforcementAgencies,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction((enforcementAgencies: SettingsTypeModel[]) => (this.enforcementAgencies = enforcementAgencies))
    );
  }

  /* istanbul ignore next */
  public upsertEnforcementAgency(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.enforcementAgency, 'Enforcement Agency').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((enforcementAgency: SettingsTypeModel) => {
        this.enforcementAgencies = Utilities.updateArray<SettingsTypeModel>(
          this.enforcementAgencies,
          enforcementAgency,
          {
            replace: !isAddRequest,
            predicate: t => t.id === enforcementAgency.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getRestrictionSeverities(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.restrictionSeverity,
      this.restrictionSeverities,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction(
        (restrictionSeverities: SettingsTypeModel[]) => (this.restrictionSeverities = restrictionSeverities)
      )
    );
  }

  /* istanbul ignore next */
  public upsertRestrictionSeverity(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request.serializeSummary(), apiUrls.restrictionSeverity, 'Restriction Severity').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((restrictionSeverity: SettingsTypeModel) => {
        this.restrictionSeverities = Utilities.updateArray<SettingsTypeModel>(
          this.restrictionSeverities,
          restrictionSeverity,
          {
            replace: !isAddRequest,
            predicate: t => t.id === restrictionSeverity.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getApprovalTypesRequired(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.approvalTypeRequired,
      this.approvalTypesRequired,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(
      tapWithAction(
        (approvalTypesRequired: SettingsTypeModel[]) => (this.approvalTypesRequired = approvalTypesRequired)
      )
    );
  }

  /* istanbul ignore next */
  public upsertApprovalTypeRequired(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.approvalTypeRequired, 'Approval Type Required').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((approvalTypeRequired: SettingsTypeModel) => {
        this.approvalTypesRequired = Utilities.updateArray<SettingsTypeModel>(
          this.approvalTypesRequired,
          approvalTypeRequired,
          {
            replace: !isAddRequest,
            predicate: t => t.id === approvalTypeRequired.id,
          }
        );
      })
    );
  }

  /* istanbul ignore next */
  public getRestrictionForms(forceRefresh: boolean = false): Observable<SettingsTypeModel[]> {
    return this.getResult(
      apiUrls.restrictionForm,
      this.restrictionForms,
      forceRefresh,
      SettingsTypeModel.deserializeList
    ).pipe(tapWithAction((restrictionForms: SettingsTypeModel[]) => (this.restrictionForms = restrictionForms)));
  }

  /* istanbul ignore next */
  public upsertRestrictionForm(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    const isAddRequest: boolean = request.id === 0;
    return this.upsert(request, apiUrls.restrictionForm, 'Restriction Form').pipe(
      map(response => SettingsTypeModel.deserialize(response)),
      tapWithAction((restrictionForm: SettingsTypeModel) => {
        this.restrictionForms = Utilities.updateArray<SettingsTypeModel>(this.restrictionForms, restrictionForm, {
          replace: !isAddRequest,
          predicate: t => t.id === restrictionForm.id,
        });
      })
    );
  }
}
