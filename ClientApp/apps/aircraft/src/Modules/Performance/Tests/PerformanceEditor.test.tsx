import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import { PerformanceStoreMock, SettingsStoreMock, SpeedScheduleSettingsStoreMock } from '../../Shared';
import { DetailsEditorWrapper, EditSaveButtons, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Provider } from 'mobx-react';
import PerformanceEditor from '../Component/PerformanceEditor';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Performance editor Module', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;

  const props = {
    classes: {},
    performanceStore: new PerformanceStoreMock(),
    settingsStore: new SettingsStoreMock(),
    speedScheduleSettingsStore: new SpeedScheduleSettingsStoreMock(),
    viewMode: VIEW_MODE.NEW,
    params: { mode: VIEW_MODE.NEW, id: 1 },
    navigate: sinon.fake(),
    sidebarStore:SidebarStore
  };
  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <PerformanceEditor {...props} />
      </ThemeProvider>
    </Provider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call onValueChange function with ViewInputControls', () => {
    const viewInputControls = wrapper.find(ViewInputControl).at(1).props();
    viewInputControls.onValueChange(null, 'mtowInPounds');
    viewInputControls.onValueChange('', 'mtowInKilos');
  });

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
    editSaveButtons.onAction(GRID_ACTIONS.SAVE);
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });

});
