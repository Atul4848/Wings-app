import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { HealthAuthStoreMock, SettingsStoreMock } from '../../Shared';
import {
  HealthAuthorizationContentWrapper,
  HealthAuthorizationViewInputControls,
  StayRequirement,
} from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Field } from 'mobx-react-form';
import { GRID_ACTIONS } from '@wings-shared/core';
import Sinon from 'sinon';
import { Provider } from 'mobx-react';

describe('Stay Requirement', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    healthAuthStore: new HealthAuthStoreMock(),
  };

  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <StayRequirement />
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
    expect(headerActions).to.be.ok;
    expect(wrapper.find(HealthAuthorizationContentWrapper)).to.be.ok;
    expect(wrapper.find(HealthAuthorizationViewInputControls)).to.be.ok;
  });

  it('should get proper field with ViewInputControlsGroup', () => {
    const field: Field = wrapper.find(HealthAuthorizationViewInputControls).prop('getField')(
      'crewStayRequirement.isStayRequired'
    );
    expect(field.label).to.eq('Stay Requirement');
  });

  it('should call onFocus function with HealthAuthorizationViewInputControls', () => {
    const loadTestTypes = Sinon.spy(props.settingsStore, 'getTestTypes');
    const loadStayLengthCategories = Sinon.spy(props.settingsStore, 'getStayLengthCategories');
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onFocus('testType');
    expect(loadTestTypes.called).to.be.true;
    viewInputControlsGroup.onFocus('stayLengthCategory');
    expect(loadStayLengthCategories.called).to.be.true;
  });

  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onValueChange(true, 'crewStayRequirement.isStayRequired');
    viewInputControlsGroup.onValueChange(false, 'crewStayRequirement.isInherited');
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(DetailsEditorHeaderSection).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(wrapper.find(DetailsEditorHeaderSection).prop('backNavTitle')).equal('Health Authorizations');
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
  });

  it('should set Active tab', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.setActiveTab();
  });
});
