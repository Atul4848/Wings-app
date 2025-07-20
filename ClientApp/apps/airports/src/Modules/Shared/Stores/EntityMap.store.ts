import { observable } from 'mobx';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { EntityMapModel, tapWithAction } from '@wings-shared/core';
import { AirportSettingsStore } from './AirportSettings.store';
import { BaseEntityMapStore, baseApiPath } from '@wings/shared';

export class EntityMapStore extends BaseEntityMapStore {
  @observable public customLocation: EntityMapModel[] = [];
  @observable public maxPOBOptions: EntityMapModel[] = [];
  @observable public securityMeasures: EntityMapModel[] = [];
  @observable public recommendedServices: EntityMapModel[] = [];
  @observable public rampSideAccess3rdPartyVendors: EntityMapModel[] = [];
  @observable public fuelTypes: EntityMapModel[] = [];
  @observable public oilTypes: EntityMapModel[] = [];
  @observable public airportTypes: EntityMapModel[] = [];
  @observable public usageTypes: EntityMapModel[] = [];
  @observable public requiredInformationTypes: EntityMapModel[] = [];

  private settingsStore = new AirportSettingsStore();

  /* istanbul ignore next */
  public loadEntities(fieldKey: string): Observable<EntityMapModel[]> {
    switch (fieldKey) {
      case 'appliedCustomsLocationInformations':
      case 'preClearCustomsLocations':
        return this.getCustomsLocationInformation();
      case 'appliedMaxPOBAltClearanceOptions':
        return this.getMaxPOBOptions();
      case 'rampSideAccess3rdPartyVendors':
        return this.getRampSideAccess3rdPartyVendors();
      case 'parkingAreaSecurityMeasures':
      case 'gaParkingSecurityMeasures':
      case 'airportSecurityMeasures':
        return this.getSecurityMeasures();
      case 'recommendedSecurityServices':
        return this.getSecurityServices();
      case 'appliedOilTypes':
        return this.getOilTypes();
      case 'appliedFuelTypes':
        return this.getFuelTypes();
      case 'appliedAirportType':
        return this.getAirportTypes();
      case 'appliedAirportUsageType':
        return this.getUsageTypes();
      case 'customsRequiredInformationTypes':
        return this.getRequiredInformationTypes();
      default:
        return of([]);
    }
  }

  /* istanbul ignore next */
  public getCustomsLocationInformation(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadCustomsLocationInformation().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.customLocation = entities))
    );
  }

  /* istanbul ignore next */
  public getMaxPOBOptions(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadMaxPOBOptions().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.maxPOBOptions = entities))
    );
  }

  /* istanbul ignore next */
  public getSecurityMeasures(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadSecurityMeasures().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.securityMeasures = entities))
    );
  }

  /* istanbul ignore next */
  public getSecurityServices(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadRecommendedServices().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.recommendedServices = entities))
    );
  }

  /* istanbul ignore next */
  public getRampSideAccess3rdPartyVendors(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadRampSideAccessThirdPartyVendors().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.rampSideAccess3rdPartyVendors = entities))
    );
  }

  /* istanbul ignore next */
  public getFuelTypes(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadFuelTypes().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.fuelTypes = entities))
    );
  }

  /* istanbul ignore next */
  public getOilTypes(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadOilTypes().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.oilTypes = entities))
    );
  }

  /* istanbul ignore next */
  public getAirportTypes(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadAirportTypes().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.airportTypes = entities))
    );
  }

  /* istanbul ignore next */
  public getUsageTypes(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadAirportUsageTypes().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.usageTypes = entities))
    );
  }

  public getRequiredInformationTypes(): Observable<EntityMapModel[]> {
    return this.settingsStore.loadRequiredInformationTypes().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.requiredInformationTypes = entities))
    );
  }
}
