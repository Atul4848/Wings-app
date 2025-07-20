import { observable } from 'mobx';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { EntityMapModel, tapWithAction } from '@wings-shared/core';
import { SettingsStore } from './Settings.store';
import { BaseEntityMapStore } from '@wings/shared';

export class EntityMapStore extends BaseEntityMapStore {
  @observable public disinsectionType: EntityMapModel[] = [];
  @observable public disinsectionChemical: EntityMapModel[] = [];
  @observable public apisRequirement: EntityMapModel[] = [];
  @observable public weaponInformation: EntityMapModel[] = [];
  @observable public documents: EntityMapModel[] = [];
  @observable public item18Contents: EntityMapModel[] = [];
  @observable public aircraftEquipments: EntityMapModel[] = [];
  private settingsStore = new SettingsStore();

  /* istanbul ignore next */
  public loadEntities(fieldKey: string): Observable<EntityMapModel[]> {
    switch (fieldKey) {
      case 'appliedDisinsectionTypes':
        return this.getCustomDisinsectionType();
      case 'appliedDisinsectionChemicals':
        return this.getCustomDisinsectionChemical();
      case 'appliedAPISRequirements':
        return this.getCustomAPISRequirement();
      case 'weaponsOnBoardRequiredDocuments':
      case 'documentsRequiredforFilings':
        return this.getCustomDocuments();
      case 'appliedWeaponInformations':
        return this.getCustomWeaponInformation();
      //FlightPlanning
      case 'appliedItem18Contents':
        return this.getFlightPlanningItem18Contents();
      case 'appliedRequiredAircraftEquipments':
        return this.getAppliedRequiredAircraftEquipments();
      default:
        return of([]);
    }
  }

  /* istanbul ignore next */
  public getCustomDisinsectionType(): Observable<EntityMapModel[]> {
    return this.settingsStore.getDisinsectionType().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.disinsectionType = entities))
    );
  }

  /* istanbul ignore next */
  public getCustomDisinsectionChemical(): Observable<EntityMapModel[]> {
    return this.settingsStore.getDisinsectionChemical().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.disinsectionChemical = entities))
    );
  }

  /* istanbul ignore next */
  public getCustomAPISRequirement(): Observable<EntityMapModel[]> {
    return this.settingsStore.getAPISRequirement().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.apisRequirement = entities))
    );
  }

  /* istanbul ignore next */
  public getCustomWeaponInformation(): Observable<EntityMapModel[]> {
    return this.settingsStore.getWeaponInformation().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.weaponInformation = entities))
    );
  }

  /* istanbul ignore next */
  public getCustomDocuments(): Observable<EntityMapModel[]> {
    return this.settingsStore.getDocuments().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.documents = entities))
    );
  }

  /* istanbul ignore next */
  public getFlightPlanningItem18Contents(): Observable<EntityMapModel[]> {
    return this.settingsStore.getItem18Content().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.item18Contents = entities))
    );
  }

  /* istanbul ignore next */
  public getAppliedRequiredAircraftEquipments(): Observable<EntityMapModel[]> {
    return this.settingsStore.getAircraftEquipment().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.aircraftEquipments = entities))
    );
  }
  
}
