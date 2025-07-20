import { observable } from 'mobx';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EntityMapModel, tapWithAction } from '@wings-shared/core';
import { SettingsStore } from './Settings.store';
import { BaseEntityMapStore } from '@wings/shared';

export class EntityMapStore extends BaseEntityMapStore {
  @observable public serviceType: EntityMapModel[] = [];
  private settingsStore = new SettingsStore();

  /* istanbul ignore next */
  public getServiceType(): Observable<EntityMapModel[]> {
    return this.settingsStore.getServiceType().pipe(
      map(results => this.mapEntities(results)),
      tapWithAction(entities => (this.serviceType = entities))
    );
  }
  
}
