import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { HealthAuthStoreMock, SettingsStoreMock } from '../../Shared';
import { DomesticMeasure, HealthAuthorizationViewInputControls } from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { DetailsEditorHeaderSection } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { Provider } from 'mobx-react';

describe('Domestic Measure', () => {
  let wrapper: any;

  const props = {
    healthAuthStore: new HealthAuthStoreMock(),
    settingsStore: new SettingsStoreMock(),
  };
  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <DomesticMeasure {...props} />
      </ThemeProvider>
    </Provider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(DetailsEditorHeaderSection).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(wrapper.find(DetailsEditorHeaderSection).prop('backNavTitle')).equal('Health Authorizations');
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
  });

  it('should call onFocus function with HealthAuthorizationViewInputControls', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onFocus('domesticMeasurePPERequired');
    viewInputControlsGroup.onFocus('domesticMeasureIdRequired');
  });
  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = wrapper.find(HealthAuthorizationViewInputControls).props();
    viewInputControlsGroup.onValueChange(true, 'domesticMeasure.isAgeExemption');
    viewInputControlsGroup.onValueChange(false, 'domesticMeasure.isPPERequired');
    viewInputControlsGroup.onValueChange(false, 'domesticMeasure.isIdentificationRequiredOnPerson');
    viewInputControlsGroup.onValueChange(true, 'domesticMeasure.isInherited');
  });
});
