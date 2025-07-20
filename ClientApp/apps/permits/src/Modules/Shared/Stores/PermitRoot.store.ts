import { PermitStore, PermitSettingsStore } from './index';

class PermitRootStore {
  public permitStore: PermitStore = new PermitStore();
  public permitSettingsStore: PermitSettingsStore = new PermitSettingsStore();
}

const rootStore = new PermitRootStore();

export default rootStore;
