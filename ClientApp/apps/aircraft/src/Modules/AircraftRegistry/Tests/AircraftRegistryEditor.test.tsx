import * as React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { SettingsStoreMock, AirframeStoreMock, AircraftRegistryStoreMock } from '../../Shared';
import sinon from 'sinon';
import { expect } from 'chai';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import { EditSaveButtons, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ViewInputControl } from '@wings-shared/form-controls';
import { AircraftRegistryEditor } from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('AircraftRegistryEditor Module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const props = {
    airframeStore: new AirframeStoreMock(),
    settingsStore: new SettingsStoreMock(),
    aircraftRegistryStore: new AircraftRegistryStoreMock(),
    params: { mode: VIEW_MODE.EDIT, id: 3 },
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AircraftRegistryEditor {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('edit button should call change view mode on props', () => {
    wrapper.setProps({ ...props, params: { mode: VIEW_MODE.DETAILS } });
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.EDIT);
    expect(props.params.mode).to.eq(VIEW_MODE.EDIT);
  });

  it('onFocus should work with fieldKey acas', () => {
    const getAcasesSpy = sinon.spy(props.settingsStore, 'getAcases');
    wrapper
      .find(ViewInputControl)
      .at(5)
      .prop('onFocus')('acas');
    expect(getAcasesSpy.called).true;
  });

  it('onFocus should work with fieldKey transponderType', () => {
    const getTranspondersSpy = sinon.spy(props.settingsStore, 'getTransponders');
    wrapper
      .find(ViewInputControl)
      .at(17)
      .prop('onFocus')('transponderType');
    expect(getTranspondersSpy.called).true;
  });

  it('onFocus should work with fieldKey airframe', () => {
    const getAirframesSpy = sinon.spy(props.airframeStore, 'getAirframes');
    wrapper
      .find(ViewInputControl)
      .at(6)
      .prop('onFocus')('airframe');
    expect(getAirframesSpy.called).true;
  });

  it('onFocus should work with fieldKey wakeTurbulenceGroup', () => {
    const getWakeTurbulenceGroupsSpy = sinon.spy(props.settingsStore, 'getWakeTurbulenceGroups');
    wrapper
      .find(ViewInputControl)
      .at(3)
      .prop('onFocus')('wakeTurbulenceGroup');
    expect(getWakeTurbulenceGroupsSpy.called).true;
  });
});
