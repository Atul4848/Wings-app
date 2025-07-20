import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { CountryModel, useRouterContext, VIEW_MODE } from '@wings/shared';
import { SettingsStoreMock, RegionStoreMock, CountryStoreMock, CountryRootStore } from '../../Shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CountryGeneralInformation } from '../Components';
import { DetailsEditorHeaderSection, SidebarStore } from '@wings-shared/layout';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Provider } from 'mobx-react';
import sinon from 'sinon';

describe('CountryGeneralInformation', () => {
  let wrapper: any;
  let viewMode = VIEW_MODE.EDIT;
  const props = {
    viewMode,
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    regionStore: new RegionStoreMock(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <Provider {...CountryRootStore}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <CountryGeneralInformation {...props} />
      </ThemeProvider>
    </Provider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should handle different actions correctly', () => {
    const detailsEditorHeaderSection = wrapper.find(DetailsEditorHeaderSection).props();
    // Simulate different actions
    detailsEditorHeaderSection.onAction(GRID_ACTIONS.EDIT);
    detailsEditorHeaderSection.onAction(GRID_ACTIONS.SAVE);
    detailsEditorHeaderSection.onAction(GRID_ACTIONS.CANCEL);
  });
  it('should set form data correctly', () => {
    const countryStore = props.countryStore as CountryStoreMock;
    const initialCountry = new CountryModel({ id: 1, officialName: 'Testland' });

    countryStore.selectedCountry = initialCountry;
    wrapper.update();

    const formValues = wrapper
      .find('CountryEditor')
      .props()
      .useUpsert
      .form.values();
    expect(formValues.officialName).to.equal('Testland');
  });

  it('should handle cases where no continent is selected', () => {
    const useUpsert = wrapper.find('CountryEditor').props().useUpsert.form;
    wrapper.setProps({ continentId: undefined });
    expect(useUpsert.values().continent).to.equal('');
  });
});
