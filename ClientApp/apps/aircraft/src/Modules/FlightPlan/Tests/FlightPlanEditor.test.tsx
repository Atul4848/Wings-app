import React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import {
  SettingsStoreMock,
  FlightPlanStoreMock,
  FlightPlanEditor,
} from '../../index';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EditSaveButtons, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import sinon from 'sinon';

describe('FlightPlanEditor module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    flightPlanStore: new FlightPlanStoreMock(),
    params: { mode: VIEW_MODE.NEW, id: 1 },
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <FlightPlanEditor {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
  it('edit button should call change view mode on props', () => {
    wrapper.setProps({ ...props, params: { mode: VIEW_MODE.DETAILS } });
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.EDIT);
    expect(props.params.mode).to.eq(VIEW_MODE.NEW);
  });

  it('should call onValueChange function with ViewInputControls', () => {
    const viewInputControls = wrapper.find(ViewInputControl).at(1).props();
    viewInputControls.onValueChange(null, 'flightPlanFormatStatus');
  });

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
    editSaveButtons.onAction(GRID_ACTIONS.SAVE);
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });

  it('should call upsert function on save button click', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    const mock = sinon.spy(props.flightPlanStore, 'upsertFlightPlan');
    editSaveButtons.onAction(GRID_ACTIONS.SAVE, 1);
    expect(mock.calledOnce).true;
  });

  it('should work with onFocus with different fieldKeys', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(0);
    // for flightPlanFormatStatus
    const getNoiseChaptersSpy = sinon.spy(props.settingsStore, 'getFlightPlanFormatStatus');
    viewInputControl.prop('onFocus')('flightPlanFormatStatus');
    expect(getNoiseChaptersSpy.called).true;

    // for accessLevel
    const getAirframeStatusSpy = sinon.spy(props.settingsStore, 'getAccessLevels');
    viewInputControl.prop('onFocus')('accessLevel');
    expect(getAirframeStatusSpy.called).true;

    // for sourceType
    const getAcarsModelsSpy = sinon.spy(props.settingsStore, 'getSourceTypes');
    viewInputControl.prop('onFocus')('sourceType');
    expect(getAcarsModelsSpy.called).true;
  });
});
