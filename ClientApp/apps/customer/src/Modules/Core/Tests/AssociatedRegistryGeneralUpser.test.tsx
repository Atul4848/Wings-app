import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import {
  AssociatedRegistryGeneralUpsert,
  CustomerStoreMock,
  EntityMapStoreMock,
  RegistryStoreMock,
  SettingsStoreMock,
} from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { useRouterContext } from '@wings/shared';
import { DetailsEditorHeaderSection } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('AssociatedRegistryGeneralUpsert', () => {
  let wrapper: any;

  const props = {
    customerStore: new CustomerStoreMock(),
    registryStore: new RegistryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    entityMapStore: new EntityMapStoreMock(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AssociatedRegistryGeneralUpsert {...props} />
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
    const field = viewInputControlsGroup.prop('field')('registry');
    expect(field.label).to.eq('Registry');
    viewInputControlsGroup.props().onValueChange('TEST', 'registry');
    viewInputControlsGroup.props().onValueChange('TEAM', 'team');
    viewInputControlsGroup.props().onValueChange('1996-03-16T00:00:00', 'endDate');
    viewInputControlsGroup.props().onValueChange('', 'endDate');
  });

  it('should change the values with onSearch function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    viewInputControlsGroup.props().onSearch('TEST','team');
    viewInputControlsGroup.props().onSearch('TEST','registry');
  });

  it('should start and stop header actions', () => {
    wrapper.find(DetailsEditorHeaderSection).props().onAction(GRID_ACTIONS.EDIT);
    // on cancel action
    wrapper.find(DetailsEditorHeaderSection).props().onAction(GRID_ACTIONS.CANCEL);
    // on save action
    wrapper.find(DetailsEditorHeaderSection).props().onAction(GRID_ACTIONS.SAVE);
  });

});
