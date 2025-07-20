import { OperationalRequirementStore } from './OperationalRequirement.store';
import { CountryStore, EntityMapStore, FIRStore, RegionStore, SettingsStore } from './index';
import {
  BaseAircraftStore,
  BasePermitStore,
  BulletinStore,
  baseApiPath,
  BaseVendorStore,
  EntityOptionsStore,
} from '@wings/shared';

class CountryRootStore {
  public countryStore: CountryStore = new CountryStore();
  public firStore: FIRStore = new FIRStore();
  public regionStore: RegionStore = new RegionStore();
  public settingsStore: SettingsStore = new SettingsStore();
  public bulletinStore: BulletinStore = new BulletinStore(baseApiPath.countries);
  public operationalRequirementStore: OperationalRequirementStore = new OperationalRequirementStore();
  public basePermitStore: BasePermitStore = new BasePermitStore();
  public baseAircraftStore: BaseAircraftStore = new BaseAircraftStore();
  public baseVendorStore: BaseVendorStore = new BaseVendorStore();
  public entityMapStore: EntityMapStore = new EntityMapStore();
  public entityOptionsStore: EntityOptionsStore = new EntityOptionsStore();
}

const rootStore = new CountryRootStore();

export default rootStore;
