import { action, observable, decorate } from 'mobx';
import { EventEmitter, THEMES, EVENT } from '@wings-shared/core';

interface IThemeState {
  current: string;
  preview: string;
}

class ThemeStore {
  readonly storageKey: string = 'currentTheme';
  readonly defaultTheme: THEMES = THEMES.LIGHT;

  public get currentTheme(): THEMES {
    const key: string = localStorage.getItem(this.storageKey)
      ? localStorage.getItem(this.storageKey)
      : this.defaultTheme;
    return key as THEMES;
  }

  public uiTheme: IThemeState = {
    current: this.currentTheme,
    preview: null,
  };

  public toggleTheme(): void {
    const theme =
      this.currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    this.updateTheme(theme);
  }

  public updateTheme(current: THEMES): void {
    this.uiTheme = { ...this.uiTheme, ...{ current, preview: null } };
    localStorage.removeItem(this.storageKey);
    localStorage.setItem(this.storageKey, current);
    EventEmitter.emit(EVENT.CHANGE_THEME, current);
  }

  public setDefaultTheme(): void {
    this.updateTheme(this.defaultTheme);
  }

  public previewTheme(preview: THEMES): void {
    this.uiTheme = { ...this.uiTheme, preview };
  }
}

decorate(ThemeStore, {
  uiTheme: observable,
  updateTheme: action,
  previewTheme: action,
});

const ThemeInstance = new ThemeStore();

export default ThemeInstance;
