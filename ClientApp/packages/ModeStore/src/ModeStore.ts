import { action, observable } from 'mobx';
import { EVENT, EventEmitter } from '@wings-shared/core';
import { IMode } from './Mode.interface';
import { MODE_TYPES } from './ModeTypes.enum';

class ModeStore {
  readonly modeActiveValue: string = 'enabled';
  readonly defaultMode: boolean = false;
  private isIncluded: boolean = false;

  @observable
  public modes: IMode = {};

  @action
  public switchMode(modeKey: MODE_TYPES, isEnabled: boolean): void {
    const modeData: IMode = {
      [modeKey]: { isEnabled, isIncluded: this.isIncluded },
    };

    if (modeKey in this.modes) {
      this.modes[modeKey].isEnabled = isEnabled;
      this.modes = { ...this.modes };
    } else {
      this.modes = { ...this.modes, ...modeData };
    }

    isEnabled
      ? localStorage.setItem(modeKey, this.modeActiveValue)
      : localStorage.removeItem(modeKey);
    EventEmitter.emit(EVENT.UPDATE_USER_MODE, isEnabled);
    // Listen only dev mode change events
    if (modeKey === MODE_TYPES.DEV) {
      EventEmitter.emit(EVENT.DEV_MODE_CHANGE, isEnabled);
    }
  }

  public isModeEnabled(mode: MODE_TYPES): boolean {
    const isActiveInClass: boolean =
      this.modes.hasOwnProperty(mode) && this.modes[mode].isEnabled;
    const isActiveInStorage: boolean =
      localStorage.getItem(`force-${mode}`) === this.modeActiveValue ||
      localStorage.getItem(mode) === this.modeActiveValue;

    return isActiveInClass || isActiveInStorage || this.defaultMode;
  }

  public hasEnabledMode(modes: MODE_TYPES[] = []): boolean {
    return (
      !modes.length ||
      modes.some((mode: MODE_TYPES) => this.isModeEnabled(mode))
    );
  }

  public get isClassicModeForced(): boolean {
    return localStorage.getItem('force-classic') === this.modeActiveValue;
  }

  public get activeModes(): string[] {
    return Object.keys(MODE_TYPES).filter((mode) =>
      this.isModeEnabled(MODE_TYPES[mode])
    );
  }

  public get isDevModeEnabled(): boolean {
    return this.isModeEnabled(MODE_TYPES.DEV);
  }

  public reset(): void {
    Object.values(MODE_TYPES).forEach((mode: string) =>
      localStorage.removeItem(mode)
    );
  }
}

export default new ModeStore();
