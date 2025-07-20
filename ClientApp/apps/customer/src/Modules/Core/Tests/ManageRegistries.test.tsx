import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { CustomerStoreMock, RegistryStoreMock, SettingsStoreMock } from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { useRouterContext } from '@wings/shared';
import { DetailsEditorHeaderSection } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ManageRegistries } from '../Components';

describe('ManageRegistries', () => {
  let wrapper: any;

  const props = {
    title: 'Manage Registries',
    backNavTitle: '',
    backNavLink: '',
    customerStore: new CustomerStoreMock(),
    registryStore: new RegistryStoreMock(),
    settingsStore: new SettingsStoreMock(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <ManageRegistries {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should return proper field by calling fieldProp', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    const field = viewInputControlsGroup.prop('field')('includeAllRegistry');
    expect(field.label).to.eq('Include All Registries');
    viewInputControlsGroup.props().onValueChange(['test', 'registry'], 'registries');
    viewInputControlsGroup.props().onValueChange('TEST', 'includeAllRegistry');
    viewInputControlsGroup.props().onValueChange('TEAM', 'team');
    viewInputControlsGroup.props().onValueChange([], 'registries');
  });

  it('should start and stop header actions', () => {
    wrapper
      .find(DetailsEditorHeaderSection)
      .props()
      .onAction(GRID_ACTIONS.EDIT);
    // on cancel action
    wrapper
      .find(DetailsEditorHeaderSection)
      .props()
      .onAction(GRID_ACTIONS.CANCEL);
  });
});
