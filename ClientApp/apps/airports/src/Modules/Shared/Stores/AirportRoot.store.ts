import { BulletinStore, baseApiPath, BaseVendorStore, BaseAirportStore, EntityOptionsStore } from '@wings/shared';
import { AirportStore } from './Airport.store';
import { AirportHoursStore } from './AirportHours.store';
import { AirportMappingStore } from './AirportMapping.store';
import { AirportSettingsStore } from './AirportSettings.store';
import { AirportCustomDetailStore } from './AirportCustomDetail.store';
import { EntityMapStore } from './EntityMap.store';

class AirportRoot {
  public airportStore: AirportStore = new AirportStore();
  public airportHoursStore: AirportHoursStore = new AirportHoursStore();
  public airportSettingsStore: AirportSettingsStore = new AirportSettingsStore();
  public airportMappingsStore: AirportMappingStore = new AirportMappingStore();
  public bulletinStore: BulletinStore = new BulletinStore(baseApiPath.airports);
  public baseVendorStore: BaseVendorStore = new BaseVendorStore();
  public baseAirportStore: BaseAirportStore = new BaseAirportStore();
  public airportCustomDetailStore: AirportCustomDetailStore = new AirportCustomDetailStore();
  public entityMapStore: EntityMapStore = new EntityMapStore();
  public entityOptionsStore: EntityOptionsStore = new EntityOptionsStore();
}

const rootStore = new AirportRoot();

export default rootStore;
