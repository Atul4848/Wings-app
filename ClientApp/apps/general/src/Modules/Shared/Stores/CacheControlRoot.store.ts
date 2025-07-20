import { ReportSummaryStore } from './ReportSummary.store';
import { FuelStore } from './Fuel.store';
import { UVGOBannerStore } from './UVGOBanner.store';
import { ScottIPCStore } from './ScottIPC.store';
import { CacheControlStore } from './CacheControl.store'
import { MobileReleaseStore } from './MobileRelease.store';
import { UvgoSettingsStore } from './UvgoSettings.store';
import { FeatureNoteStore } from './FeatureNote.store';
import { SyncHistoryStore } from './SyncHistory.store';
import { SyncHistoryChangeModel } from '../Models';
import { SyncTroubleshootStore } from './SyncTroubleshoot.store';
import { SyncSettingsStore } from './SyncSettings.store';
import { RetailDataStore } from './RetailData.store';
import { ActiveUsersStore } from './ActiveUsers.store';

class CacheControlRootStore {
  cacheControlStore: CacheControlStore = new CacheControlStore();
  mobileReleaseStore: MobileReleaseStore = new MobileReleaseStore();
  activeUsersStore: ActiveUsersStore = new ActiveUsersStore();
  reportSummaryStore: ReportSummaryStore = new ReportSummaryStore();
  fuelStore: FuelStore = new FuelStore();
  uvgoBannerStore: UVGOBannerStore = new UVGOBannerStore();
  scottIPCStore: ScottIPCStore = new ScottIPCStore();
  uvgoSettingsStore: UvgoSettingsStore = new UvgoSettingsStore();
  featureNoteStore: FeatureNoteStore = new FeatureNoteStore();
  syncHistoryStore: SyncHistoryStore = new SyncHistoryStore();
  syncHistoryChangesModel: SyncHistoryChangeModel = new SyncHistoryChangeModel();
  syncTroubleshootStore: SyncTroubleshootStore = new SyncTroubleshootStore();
  syncSettingsStore: SyncSettingsStore = new SyncSettingsStore();
  retailDataStore: RetailDataStore = new RetailDataStore();
}

const cacheControlRootStore = new CacheControlRootStore();

export default cacheControlRootStore;