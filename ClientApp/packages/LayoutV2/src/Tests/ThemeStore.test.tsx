import { THEMES } from '@wings-shared/core';
import ThemeInstance from '../Stores/Theme.store';
import { expect } from 'chai';

describe('ThemeStore', () => {
  let themeStore;

  beforeEach(() => {
    themeStore = ThemeInstance;
  });


  it('should have a default theme of LIGHT', () => {
    expect(themeStore.defaultTheme).to.equal(THEMES.LIGHT);
  });

  it('should initialize with the default theme', () => {
    expect(themeStore.currentTheme).to.equal(themeStore.defaultTheme);
  });

  it('should toggle the theme between DARK and LIGHT', () => {
    themeStore.toggleTheme();
    expect(themeStore.currentTheme).to.equal(THEMES.DARK);

    themeStore.toggleTheme();
    expect(themeStore.currentTheme).to.equal(THEMES.LIGHT);
  });

  it('should update the theme', () => {
    const newTheme = THEMES.DARK;
    themeStore.updateTheme(newTheme);
    expect(themeStore.currentTheme).to.equal(newTheme);
  });

  it('should set the default theme', () => {
    themeStore.updateTheme(THEMES.DARK);
    themeStore.setDefaultTheme();
    expect(themeStore.currentTheme).to.equal(themeStore.defaultTheme);
  });

  it('should preview a theme', () => {
    const previewTheme = THEMES.DARK;
    themeStore.previewTheme(previewTheme);
    expect(themeStore.uiTheme.preview).to.equal(previewTheme);
  });

});
