import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { CountryModel, useRouterContext } from '@wings/shared';
import { AFFECTED_TYPE, AUTHORIZATION_LEVEL, HealthAuthStoreMock, SettingsStoreMock } from '../../Shared';
import { EditSaveButtons, SidebarStore } from '@wings-shared/layout';
import { ViewInputControl } from '@wings-shared/form-controls';
import { SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { HealthAuthorizationGeneral } from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('HealthAuthorizationGeneral', () => {
  let wrapper;
  const props = {
    settingsStore: new SettingsStoreMock(),
    healthAuthStore: new HealthAuthStoreMock(),
    sidebarStore: SidebarStore,
  };
  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <HealthAuthorizationGeneral {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should work with authorizationLevel', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(0)
      .props();

    // For State
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.STATE }),
      'authorizationLevel'
    );

    // For Airport
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.AIRPORT }),
      'authorizationLevel'
    );

    // For Country
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.COUNTRY }),
      'authorizationLevel'
    );
  });

  it('should work with affectedType', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(3)
      .props();

    // For Nationality
    viewIputControl.onValueChange(new SettingsTypeModel({ id: 0, name: AFFECTED_TYPE.NATIONALITY }), 'affectedType');

    // For Traveled Country
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AFFECTED_TYPE.TRAVELED_COUNTRY }),
      'affectedType'
    );

    // For Both
    viewIputControl.onValueChange(new SettingsTypeModel({ id: 0, name: AFFECTED_TYPE.BOTH }), 'affectedType');
  });

  it('should work with healthAuthTraveledCountries', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(7)
      .props();
    viewIputControl.onValueChange([new CountryModel()], 'healthAuthTraveledCountries');
  });

  it('should work with healthAuthNationalities', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(5)
      .props();
    viewIputControl.onValueChange([new CountryModel()], 'healthAuthNationalities');
  });

  it('should work with region', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(4)
      .props();
    viewIputControl.onValueChange([new CountryModel()], 'region');

    //For region id
    viewIputControl.onValueChange([new CountryModel({ id: 1 })], 'region');
  });

  it('should work with receivedBy', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(13)
      .props();
    viewIputControl.onValueChange(new SettingsTypeModel({ id: 0 }), 'receivedBy');
  });

  it('should work with receivedDate', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(14)
      .props();
    viewIputControl.onValueChange('test', 'receivedDate');

    //For Invalid date
    viewIputControl.onValueChange('Invalid date', 'receivedDate');

    //For empty value
    viewIputControl.onValueChange('', 'receivedDate');
  });

  it('should work with accessLevel', () => {
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(9)
      .props();
    viewIputControl.onValueChange('test', 'accessLevel');
  });

  it('should render getOptionDisabled method', () => {
    wrapper
      .find(ViewInputControl)
      .at(5)
      .props()
      .getOptionDisabled(new SettingsTypeModel(), [new SettingsTypeModel()]);

    // if value is empty
    wrapper
      .find(ViewInputControl)
      .at(5)
      .props()
      .getOptionDisabled(new SettingsTypeModel(), '');
  });

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
  });

  it('cancel button should cancel the made changes', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });

  it('save button should save the record', () => {
    const getUpdatedModelSpy = sinon.spy(props.healthAuthStore, 'upsertHealthAuth');
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.SAVE);
    expect(getUpdatedModelSpy.called).to.be.true;
  });

  it('should load dropdown options on search', () => {
    // with authorizationLevel Country
    const viewIputControl = wrapper
      .find(ViewInputControl)
      .at(1)
      .props();
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.COUNTRY }),
      'authorizationLevel'
    );
    viewIputControl.onSearch('test', 'levelDesignator');

    // with authorizationLevel state
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.STATE }),
      'authorizationLevel'
    );
    viewIputControl.onSearch('test', 'levelDesignator');

    // with authorizationLevel Airport
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.AIRPORT }),
      'authorizationLevel'
    );
    viewIputControl.onSearch('test', 'levelDesignator');

    //  with healthAuthTraveledCountries
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.COUNTRY }),
      'authorizationLevel'
    );
    viewIputControl.onSearch('test', 'healthAuthTraveledCountries');
  });

  it('should work with default search focus', () => {
    wrapper
      .find(ViewInputControl)
      .at(5)
      .props()
      .onFocus('levelDesignator');

    wrapper
      .find(ViewInputControl)
      .at(0)
      .props()
      .onFocus('authorizationLevel');

    wrapper
      .find(ViewInputControl)
      .at(2)
      .props()
      .onFocus('affectedType');

    wrapper
      .find(ViewInputControl)
      .at(1)
      .props()
      .onFocus('infectionType');

    wrapper
      .find(ViewInputControl)
      .at(10)
      .props()
      .onFocus('sourceType');

    wrapper
      .find(ViewInputControl)
      .at(9)
      .props()
      .onFocus('accessLevel');

    wrapper
      .find(ViewInputControl)
      .at(8)
      .props()
      .onFocus('healthAuthNationalities');

    wrapper
      .find(ViewInputControl)
      .at(6)
      .props()
      .onFocus('healthAuthTraveledCountries');

    wrapper
      .find(ViewInputControl)
      .at(3)
      .props()
      .onFocus('region');
  });
});
