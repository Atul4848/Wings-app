import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { VIEW_MODE, EntityOptionsStoreMock, useRouterContext } from '@wings/shared';
import {
  AircraftOperatorRestrictionsStoreMock,
  AircraftOperatorSettingsStoreMock,
  SettingsStoreMock,
} from '../../Shared/Mocks';
import sinon from 'sinon';
import { Field } from 'mobx-react-form';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import UpsertAircraftOperatorRestriction from '../UpsertAircraftOperatorRestriction/UpsertAircraftOperatorRestriction';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('UpsertAircraftOperatorRestriction Module', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;
  const aircraftOperatorRestrictionsStore = new AircraftOperatorRestrictionsStoreMock();
  const settingsStore = new SettingsStoreMock();
  const entityOptionsStore = new EntityOptionsStoreMock();
  const aircraftOperatorSettingsStore = new AircraftOperatorSettingsStoreMock();
  const sidebarStore = SidebarStore;
  const props = {
    classes: {},
    aircraftOperatorRestrictionsStore,
    settingsStore,
    entityOptionsStore,
    aircraftOperatorSettingsStore,
    viewMode: VIEW_MODE.NEW,
    params: { id: '1', viewMode: VIEW_MODE.NEW },
    sidebarStore
  };
  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <UpsertAircraftOperatorRestriction {...props} />
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
    const field: Field = wrapper.find(ViewInputControlsGroup).prop('field')('effectedEntity');
    expect(field.label).to.eq('Effected Entity*');
  });

  it('should call onFocus function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onFocus('effectedEntityType');
    viewInputControlsGroup.onFocus('restrictionSource');
    viewInputControlsGroup.onFocus('restrictionType');
    viewInputControlsGroup.onFocus('restrictionSeverity');
    viewInputControlsGroup.onFocus('aircraftOperatorRestrictionForms');
    viewInputControlsGroup.onFocus('uwaAllowableServices');
    viewInputControlsGroup.onFocus('approvalTypeRequired');
    viewInputControlsGroup.onFocus('uwaAllowableActions');
    viewInputControlsGroup.onFocus('enforcementAgency');
    viewInputControlsGroup.onFocus('accessLevel');
    viewInputControlsGroup.onFocus('sourceType');
  })

  it('should call onSearch function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onSearch(null, 'nationalities');
    viewInputControlsGroup.onSearch(null, 'restrictingCountry');
    viewInputControlsGroup.onSearch('ab', 'effectedEntity');
  });

  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onValueChange("ab", 'nationalities');
    viewInputControlsGroup.onValueChange(null, 'restrictingCountry');
    viewInputControlsGroup.onValueChange(null, 'effectedEntityType');
    viewInputControlsGroup.onValueChange('PB', 'uwaAllowableActions');
    viewInputControlsGroup.onValueChange(true, 'restrictionAppliedToLicenseHolder');
    viewInputControlsGroup.onValueChange(true, 'restrictionAppliedToRegistries');
    viewInputControlsGroup.onValueChange(false, 'restrictionAppliedToAllFlights');
    viewInputControlsGroup.onValueChange(false, 'restrictionAppliedToOperators');
    viewInputControlsGroup.onValueChange(false, 'restrictionAppliedToPassportedPassenger');
    viewInputControlsGroup.onValueChange(false, 'sfc');
    viewInputControlsGroup.onValueChange(false, 'unl');
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(DetailsEditorHeaderSection).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(wrapper.find(DetailsEditorHeaderSection).prop('backNavTitle')).equal('Aircraft Operator Restrictions');
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
  });
});
