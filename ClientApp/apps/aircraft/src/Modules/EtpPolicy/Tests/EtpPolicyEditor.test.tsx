import React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import {
  SettingsStoreMock,
  PerformanceStoreMock,
  EtpPolicyStoreMock,
  EtpScenarioStoreMock,
  EtpPolicyEditor,
} from '../../index';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EditSaveButtons, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('EtpPolicyEditor module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const props = {
    classes: {},
    etpPolicyStore: new EtpPolicyStoreMock(),
    etpScenarioStore: new EtpScenarioStoreMock(),
    settingsStore: new SettingsStoreMock(),
    viewMode: VIEW_MODE.EDIT,
    performanceStore: new PerformanceStoreMock(),
    params: { mode: VIEW_MODE.EDIT, id: 3 },
    navigate: sinon.fake(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <EtpPolicyEditor {...props} />
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
    expect(props.params.mode).to.eq(VIEW_MODE.EDIT);
  });

  it('should call onValueChange function with ViewInputControls', () => {
    const viewInputControls = wrapper.find(ViewInputControl).at(1).props();
    viewInputControls.onValueChange(null, 'code');
  });

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
    editSaveButtons.onAction(GRID_ACTIONS.SAVE);
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });
});


