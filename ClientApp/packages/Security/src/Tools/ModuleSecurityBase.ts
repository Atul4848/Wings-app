import { ModeStore } from '@wings-shared/mode-store';
import { MODULE_ACTIONS, MODULE_NAMES } from '../Enums';
import { ModulePermissionsStore } from '../Stores';
import { ModulePermissions } from '../Types';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';

class ModuleSecurityBase<TSubModuleNames extends string> {
  protected hiddenSubModules: string[];
  private _hideModuleSettings: string[] = [];
  private moduleName: MODULE_NAMES;
  private readonly env = new EnvironmentVarsStore();
  private modulePermissionsStore = new ModulePermissionsStore();

  constructor(moduleName: MODULE_NAMES) {
    this._hideModuleSettings = this.getSettings();
    this.moduleName = moduleName;
    this.hiddenSubModules = this.hideSubModulesSettings(this.moduleName);
  }

  public get isEditable(): boolean {
    return !!this.modulePermissionsStore.getModulePermissions(this.moduleName)?.hasAccessToAction(MODULE_ACTIONS.EDIT);
  }

  protected setModulePermissions(permissions: ModulePermissions): void {
    this.modulePermissionsStore.addModule(this.moduleName, permissions);
  }

  // Tokenizer variable as comma separated string (i.e 'country, country.states') To ['country', 'country.states']
  private getSettings(): string[] {
    const settings = this.env.getVar(ENVIRONMENT_VARS.HIDDEN_MODULES) || '';
    return settings.toLocaleLowerCase().split(',');
  }

  // Get settings based on current module(country,airports) and return sub modules i.e [state, city, isLands]
  public hideSubModulesSettings(moduleName: MODULE_NAMES): string[] {
    const subModuleSetting = `${moduleName.toLowerCase()}.`;
    return this._hideModuleSettings.filter(m => m.includes(subModuleSetting)).map(s => s.split('.')[1]);
  }

  public isSubModuleVisible(moduleName: TSubModuleNames): boolean {
    if (ModeStore.isDevModeEnabled) {
      return true;
    }
    return !this.hiddenSubModules.includes(moduleName?.toLocaleLowerCase());
  }
}

export default ModuleSecurityBase;
