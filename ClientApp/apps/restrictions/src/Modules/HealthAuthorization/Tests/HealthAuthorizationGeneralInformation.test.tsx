import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import { HealthAuthStoreMock, SettingsStoreMock } from '../../Shared';
import { EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { GeneralRequirement, HealthAuthorizationGeneralInformation } from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Provider } from 'mobx-react';

describe('HealthAuthorizationGeneralInformation', () => {
  let wrapper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    healthAuthStore: new HealthAuthStoreMock(),
  };

  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <HealthAuthorizationGeneralInformation {...props} />
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

  it('should call GeneralRequirementV2 functions', () => {
    const generalRequirement = wrapper.find(GeneralRequirement).props();
    generalRequirement.getField('generalInformation.generalInfo');
    generalRequirement.onChange([], 'generalInformation.generalInfo');
    generalRequirement.onRowEdit(true);
  });

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
    editSaveButtons.onAction(GRID_ACTIONS.SAVE);
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });
});
