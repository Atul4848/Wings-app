import React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import AirportSecurity from '../Components/AirportSecurity/AirportSecurity';
import { AirportSettingsStoreMock, AirportStoreMock, EntityMapStoreMock } from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { useRouterContext } from '@wings/shared';
import { GRID_ACTIONS } from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';

describe('AirportSecurity module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const props = {
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    entityMapStore: new EntityMapStoreMock(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AirportSecurity {...props} />
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
    expect(wrapper.find(ViewInputControlsGroup)).to.have.length(1);
  });

  it('should return proper field by calling fieldProp', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    const field = viewInputControlsGroup.prop('field')('rampSideAccess');
    expect(field.label).to.eq('Ramp Side Access');
  });

  it('should test onFocus with rampSideAccess3rdParty field', () => {
    const loadRampSideAccessThirdParty = sinon.spy(props.airportSettingsStore, 'loadRampSideAccessThirdParty');
    wrapper.find(ViewInputControlsGroup).prop('onFocus')('rampSideAccess3rdParty');
    expect(loadRampSideAccessThirdParty.called).to.be.true;
  });
  it('should test onFocus with rampSideAccess field', () => {
    const loadRampSideAccess = sinon.spy(props.airportSettingsStore, 'loadRampSideAccess');
    wrapper.find(ViewInputControlsGroup).prop('onFocus')('rampSideAccess');
    expect(loadRampSideAccess.called).to.be.true;
  });
  
  it('should test onFocus with other fields', () => {
    const loadEntities = sinon.spy(props.entityMapStore, 'loadEntities');
    wrapper.find(ViewInputControlsGroup).prop('onFocus')('rampSideAccess3rdPartyVendors');
    expect(loadEntities.calledWith('rampSideAccess3rdPartyVendors')).to.be.true;
  });

  it('should test onAction method with save action', () => {
    const upsertAirportSecurity = sinon.spy(props.airportStore, 'upsertAirportSecurity');
    headerActions.find(DetailsEditorHeaderSection).prop('onAction')(GRID_ACTIONS.SAVE);
    expect(upsertAirportSecurity.called).to.be.true;
  });
});
