import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import {
  ContactCommsGeneralInfo,
  CustomerStoreMock,
  EntityMapStoreMock,
  OperatorStoreMock,
  RegistryStoreMock,
  SettingsStoreMock,
} from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { useRouterContext } from '@wings/shared';
import { DetailsEditorHeaderSection, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('ContactCommsGeneralInfo', () => {
  let wrapper: any;

  const props = {
    customerStore: new CustomerStoreMock(),
    registryStore: new RegistryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    entityMapStore: new EntityMapStoreMock(),
    operatorStore: new OperatorStoreMock(),
    sidebarStore: SidebarStore,
    isCommunicationView: false,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <ContactCommsGeneralInfo {...props} />
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
    const field = viewInputControlsGroup.prop('field')('contact');
    expect(field.label).to.eq('Contact');
    viewInputControlsGroup.props().onValueChange({ id: 1, label: 'New Contact' }, 'contactLinkType');
    viewInputControlsGroup.props().onValueChange({ id: 2, label: 'Link Existing Contact' }, 'contactLinkType');
    viewInputControlsGroup
      .props()
      .field('contactLinkType')
      .set({ id: 1, label: 'New Contact' });
    viewInputControlsGroup.props().onValueChange('test@gmail.com', 'contact');
    viewInputControlsGroup
      .props()
      .field('contactLinkType')
      .set({ id: 2, label: 'Link Existing Contact' });
      viewInputControlsGroup.props().onValueChange('', 'contact');
    viewInputControlsGroup.props().onValueChange('contact', 'contact');
    viewInputControlsGroup.props().onValueChange({ id: 1, label: 'Personal Email' }, 'contactType');
    viewInputControlsGroup.props().onValueChange({ id: 2, label: 'Phone' }, 'contactType');

    //should change the value of contact method
    viewInputControlsGroup.props().onValueChange('', 'contactMethod');
    viewInputControlsGroup.props().onValueChange({ id: 1, label: 'Phone' }, 'contactMethod');
    viewInputControlsGroup.props().onValueChange({ id: 2, label: 'Fax' }, 'contactMethod');
    viewInputControlsGroup.props().onValueChange({ id: 3, label: 'Email' }, 'contactMethod');
    //test with phone number
    viewInputControlsGroup
      .props()
      .field('contact')
      .set('+39638527412');
    viewInputControlsGroup.props().onValueChange({ id: 1, label: 'Phone' }, 'contactMethod');
    //test with email
    viewInputControlsGroup
    .props()
    .field('contact')
    .set('test@gmail.com');
    viewInputControlsGroup.props().onValueChange({ id: 3, label: 'Email' }, 'contactMethod');

    viewInputControlsGroup.props().onValueChange('', 'contactName');
    viewInputControlsGroup.props().onValueChange({ id: 1, name: 'customer' }, 'communications.communicationLevel');
    viewInputControlsGroup.props().onValueChange('', 'communications.communicationLevel');
    viewInputControlsGroup.props().onValueChange('customer', 'communications.customer');
    viewInputControlsGroup.props().onValueChange('', 'operator');  
});

  it('should change the values with onSearch function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    viewInputControlsGroup.props().onSearch('customer', 'customer');
    viewInputControlsGroup.props().onSearch('contact', 'contact');
    viewInputControlsGroup.props().onSearch('site', 'site');
    viewInputControlsGroup.props().onSearch('registry', 'registry');
    viewInputControlsGroup
      .props()
      .field('communications.communicationLevel')
      .set({ id: 3, name: 'Registry' });
    viewInputControlsGroup.props().onSearch('registry', 'registry');
    viewInputControlsGroup.props().onSearch('operator', 'operator');
    viewInputControlsGroup
      .props()
      .field('communications.communicationLevel')
      .set({ id: 2, name: 'Operator' });
    viewInputControlsGroup.props().onSearch('operator', 'operator');
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
    // on save action
    wrapper
      .find(DetailsEditorHeaderSection)
      .props()
      .onAction(GRID_ACTIONS.SAVE);
  });
});
