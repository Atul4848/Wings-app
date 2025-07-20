import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { VIEW_MODE, useRouterContext } from '@wings/shared';
import { ScheduleRestrictionsStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import sinon from 'sinon';
import { Field } from 'mobx-react-form';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import UpsertScheduleRestriction from '../UpsertScheduleRestrictions/UpsertScheduleRestrictions';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('UpsertScheduleRestriction Module', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;
  const scheduleRestrictionsStore = new ScheduleRestrictionsStoreMock();
  const settingsStore = new SettingsStoreMock();

  const sidebarStore = SidebarStore;
  const props = {
    classes: {},
    scheduleRestrictionsStore,
    settingsStore,
    viewMode: VIEW_MODE.NEW,
    sidebarStore,
  };
  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <UpsertScheduleRestriction {...props} />
    </ThemeProvider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(headerActions).to.be.ok;
    //render ViewInputControlsGroup
    expect(wrapper.find(ViewInputControlsGroup)).to.be.ok;
  });

  it('should get proper field with ViewInputControlsGroup', () => {
    const field: Field = wrapper.find(ViewInputControlsGroup).prop('field')('restrictionType');
    expect(field.label).to.eq('Restriction Type*');
  });

  it('should call onSearch function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onSearch(null, 'State');
    viewInputControlsGroup.onSearch(null, 'Airport');
    viewInputControlsGroup.onSearch('ab', 'Country');
    viewInputControlsGroup.onSearch('ab', 'restrictingEntities');
    viewInputControlsGroup.onSearch('ab', 'farTypes');
    viewInputControlsGroup.onSearch(null, 'FIR');
  });

  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onValueChange('ab', 'restrictionType');
    viewInputControlsGroup.onValueChange(null, 'departureLevel');
    viewInputControlsGroup.onValueChange(null, 'arrivalLevel');
    viewInputControlsGroup.onValueChange('PB', 'overFlightLevel');
    viewInputControlsGroup.onValueChange(true, 'isAllDeparture');
    viewInputControlsGroup.onValueChange(true, 'isAllArrival');
    viewInputControlsGroup.onValueChange(false, 'isAllOverFlight');
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(DetailsEditorHeaderSection).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(wrapper.find(DetailsEditorHeaderSection).prop('backNavTitle')).equal('Schedule Restrictions');
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
  });
});
