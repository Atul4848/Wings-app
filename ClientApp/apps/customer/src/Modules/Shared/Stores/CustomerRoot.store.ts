import { CustomerStore } from './Customer.store';
import { SettingsStore } from './Settings.store';
import { RegistryStore } from './Registry.store';
import { OperatorStore } from './Operator.store';
import { SiteStore } from './Site.store';
import { EntityMapStore } from './EntityMap.store';
import { CustomerMappingsStore } from './CustomerMappings.store';
import { BaseAircraftStore } from '@wings/shared';
import { TeamStore } from './Team.store';

class CustomerRoot {
  public customerStore: CustomerStore = new CustomerStore();
  public settingsStore: SettingsStore = new SettingsStore();
  public registryStore: RegistryStore = new RegistryStore();
  public operatorStore: OperatorStore = new OperatorStore();
  public siteStore: SiteStore = new SiteStore();
  public entityMapStore: EntityMapStore = new EntityMapStore();
  public baseAircraftStore: BaseAircraftStore = new BaseAircraftStore();
  public customerMappingsStore: CustomerMappingsStore = new CustomerMappingsStore();
  public teamStore: TeamStore = new TeamStore();
}

const customerRoot = new CustomerRoot();

export default customerRoot;
