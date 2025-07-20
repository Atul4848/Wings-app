import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { VIEW_MODE } from '@wings/shared';
import {
  AUTHORIZATION_LEVEL,
  HealthAuthStoreMock,
  HealthVendorContactModel,
  HealthVendorStoreMock,
  SettingsStoreMock,
} from '../../Shared';
import { HealthVendorEditor, HealthVendorTabs } from '../index';
import { EditSaveButtons, SidebarStore } from '@wings-shared/layout';
import { ViewInputControl } from '@wings-shared/form-controls';
import { SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('HealthVendorEditor', () => {
  let wrapper: any;

  const props = {
    settingsStore: new SettingsStoreMock(),
    healthAuthStore: new HealthAuthStoreMock(),
    healthVendorStore: new HealthVendorStoreMock(),
    viewMode: VIEW_MODE.NEW,
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = mount(
      <Provider {...props}>
        <ThemeProvider theme={createTheme(LightTheme)}>
          <MemoryRouter>
            <HealthVendorEditor {...props} />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
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
      .at(1)
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

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
  });

  it('cancel button should cancel the made changes', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });

  it('save button should save the record', () => {
    const getUpdatedModelSpy = sinon.spy(props.healthVendorStore, 'upsertHealthVendor');
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
    viewIputControl.onSearch('test', 'vendorLevelEntity');

    // with authorizationLevel state
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.STATE }),
      'authorizationLevel'
    );
    viewIputControl.onSearch('test', 'vendorLevelEntity');

    // with authorizationLevel Airport
    viewIputControl.onValueChange(
      new SettingsTypeModel({ id: 0, name: AUTHORIZATION_LEVEL.AIRPORT }),
      'authorizationLevel'
    );
    viewIputControl.onSearch('test', 'vendorLevelEntity');
  });

  it('should work with default search focus and change', () => {
    const viewInputControl = wrapper
      .find(ViewInputControl)
      .at(0)
      .props();

    viewInputControl.onValueChange(true, 'name');
    viewInputControl.onFocus('name');
    viewInputControl.onSearch('CD', 'name');
  });

  it('should work for contact info tab', () => {
    const healthVendorTabs = wrapper.find(HealthVendorTabs);
    healthVendorTabs.props().onContactEditing();
    healthVendorTabs.props().onUpdate(new HealthVendorContactModel({ id: 2 }), true);
    healthVendorTabs.props().onUpdate(new HealthVendorContactModel({ id: 2 }));
    healthVendorTabs.props().onUpdate(new HealthVendorContactModel({ tempId: 0, id: 0 }));
  });
});
