import { BaseCustomerStore } from '@wings/shared';
import { EtpPolicyStore } from './EtpPolicy.store';
import {
  SpeedScheduleSettingsStore,
  SettingsStore,
  FlightPlanStore,
  AvionicsSettingsStore,
  EtpSettingsStore,
  EtpScenarioStore,
  PerformanceStore,
  AircraftVariationStore,
  AirframeStore,
  AircraftRegistryStore,
  GenericRegistryStore,
  FlightPlanningServiceStore,
} from './index';

class AircraftRootStore {
  public settingsStore: SettingsStore = new SettingsStore();
  public flightPlanStore: FlightPlanStore = new FlightPlanStore();
  public flightPlanningServiceStore: FlightPlanningServiceStore = new FlightPlanningServiceStore();
  public avionicsSettingsStore: AvionicsSettingsStore = new AvionicsSettingsStore();
  public etpSettingsStore: EtpSettingsStore = new EtpSettingsStore();
  public speedScheduleSettingsStore: SpeedScheduleSettingsStore = new SpeedScheduleSettingsStore();
  public etpScenarioStore: EtpScenarioStore = new EtpScenarioStore();
  public etpPolicyStore: EtpPolicyStore = new EtpPolicyStore();
  public performanceStore: PerformanceStore = new PerformanceStore();
  public aircraftVariationStore: AircraftVariationStore = new AircraftVariationStore();
  public airframeStore: AirframeStore = new AirframeStore();
  public aircraftRegistryStore: AircraftRegistryStore = new AircraftRegistryStore();
  public genericRegistryStore: GenericRegistryStore = new GenericRegistryStore();
  public customerStore: BaseCustomerStore = new BaseCustomerStore();
}

const rootStore = new AircraftRootStore();

export default rootStore;
