import { AircraftOperatorSettings } from '../Stores';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Utilities, SettingsTypeModel } from '@wings-shared/core';

export class AircraftOperatorSettingsStoreMock extends AircraftOperatorSettings {
  public getAircraftOperatorRestrictionTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((aircraftOperatorRestrictionTypes: SettingsTypeModel[]) => {
        this.aircraftOperatorRestrictionTypes = aircraftOperatorRestrictionTypes;
      })
    );
  }

  public upsertAircraftOperatorRestrictionType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((aircraftOperatorRestrictionType: SettingsTypeModel) => {
        this.aircraftOperatorRestrictionTypes = Utilities.updateArray<SettingsTypeModel>(
          this.aircraftOperatorRestrictionTypes,
          aircraftOperatorRestrictionType,
          {
            replace: true,
            predicate: t => t.id === aircraftOperatorRestrictionType.id,
          }
        );
      })
    );
  }

  public getEffectedEntityTypes(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((effectedEntityTypes: SettingsTypeModel[]) => {
        this.effectedEntityTypes = effectedEntityTypes;
      })
    );
  }

  public upsertEffectedEntityType(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((effectedEntityType: SettingsTypeModel) => {
        this.effectedEntityTypes = Utilities.updateArray<SettingsTypeModel>(
          this.effectedEntityTypes,
          effectedEntityType,
          {
            replace: true,
            predicate: t => t.id === effectedEntityType.id,
          }
        );
      })
    );
  }

  public getEnforcementAgencies(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((enforcementAgencies: SettingsTypeModel[]) => {
        this.enforcementAgencies = enforcementAgencies;
      })
    );
  }

  public upsertEnforcementAgency(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((enforcementAgency: SettingsTypeModel) => {
        this.enforcementAgencies = Utilities.updateArray<SettingsTypeModel>(
          this.enforcementAgencies,
          enforcementAgency,
          {
            replace: true,
            predicate: t => t.id === enforcementAgency.id,
          }
        );
      })
    );
  }

  public getRestrictionSeverities(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((restrictionSeverities: SettingsTypeModel[]) => {
        this.restrictionSeverities = restrictionSeverities;
      })
    );
  }

  public upsertRestrictionSeverity(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((restrictionSeverity: SettingsTypeModel) => {
        this.restrictionSeverities = Utilities.updateArray<SettingsTypeModel>(
          this.restrictionSeverities,
          restrictionSeverity,
          {
            replace: true,
            predicate: t => t.id === restrictionSeverity.id,
          }
        );
      })
    );
  }

  public getApprovalTypesRequired(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((approvalTypesRequired: SettingsTypeModel[]) => {
        this.approvalTypesRequired = approvalTypesRequired;
      })
    );
  }

  public upsertApprovalTypeRequired(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((approvalTypeRequired: SettingsTypeModel) => {
        this.approvalTypesRequired = Utilities.updateArray<SettingsTypeModel>(
          this.approvalTypesRequired,
          approvalTypeRequired,
          {
            replace: true,
            predicate: t => t.id === approvalTypeRequired.id,
          }
        );
      })
    );
  }

  public getRestrictionForms(forceRefresh?: boolean): Observable<SettingsTypeModel[]> {
    return of([ new SettingsTypeModel(), new SettingsTypeModel() ]).pipe(
      tap((restrictionForms: SettingsTypeModel[]) => {
        this.restrictionForms = restrictionForms;
      })
    );
  }

  public upsertRestrictionForm(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel()).pipe(
      tap((restrictionForm: SettingsTypeModel) => {
        this.restrictionForms = Utilities.updateArray<SettingsTypeModel>(this.restrictionForms, restrictionForm, {
          replace: true,
          predicate: t => t.id === restrictionForm.id,
        });
      })
    );
  }
}
