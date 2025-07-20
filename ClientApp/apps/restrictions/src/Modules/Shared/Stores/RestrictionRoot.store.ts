import { EntityOptionsStore } from '@wings/shared';
import { HealthVendorStore } from './HealthVendor.store';
import {
  SettingsStore,
  HealthAuthStore,
  ScheduleRestrictionsStore,
  AircraftOperatorSettings,
  AircraftOperatorRestrictionsStore,
} from '../Stores';

class RestrictionRootStore {
  public settingsStore: SettingsStore = new SettingsStore();
  public healthAuthStore: HealthAuthStore = new HealthAuthStore();
  public healthVendorStore: HealthVendorStore = new HealthVendorStore();
  public scheduleRestrictionsStore: ScheduleRestrictionsStore = new ScheduleRestrictionsStore();
  public aircraftOperatorSettingsStore: AircraftOperatorSettings = new AircraftOperatorSettings();
  public aircraftOperatorRestrictionsStore: AircraftOperatorRestrictionsStore = new AircraftOperatorRestrictionsStore();
  public entityOptionsStore: EntityOptionsStore = new EntityOptionsStore();
}

const rootStore = new RestrictionRootStore();

export default rootStore;
