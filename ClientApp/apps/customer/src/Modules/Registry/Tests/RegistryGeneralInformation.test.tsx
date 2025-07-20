import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { RegistryGeneralInformation } from '../Components';
import { RegistryStoreMock, SettingsStoreMock } from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { useRouterContext } from '@wings/shared';
import { DetailsEditorHeaderSection } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('RegistryGeneralInformation', () => {
  let wrapper;

  const props = {
    registryStore: new RegistryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    title: 'Registry Information',
    onValueChange: sinon.spy(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <RegistryGeneralInformation {...props} />
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
    const field = viewInputControlsGroup.prop('field')('name');
    expect(field.label).to.eq('Name');
    props.onValueChange('TEST', 'name');
    expect(props.onValueChange.calledWith('TEST', 'name')).to.be.true;
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
