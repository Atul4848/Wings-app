import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';
import { AdditionalInfo } from '../Components';
import { Provider } from 'mobx-react';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';

describe('Permit Additional Info Component', () => {
  let wrapper: any;

  const props = {
    classes: {},
    navigate: sinon.spy(),
    sidebarStore: SidebarStore,
    permitSettingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(),
    params: { permitId: 1, viewMode: VIEW_MODE.EDIT },
  };

  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <AdditionalInfo {...props} />
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
    expect(wrapper).to.have.length(1);
  });

  it('should call onFocus function with ViewInputControlsGroup', () => {
      const loadPrerequisiteTypes = sinon.spy(props.permitSettingsStore, 'getpermitPrerequisiteTypes');
      const loadBlanketValidityTypes = sinon.spy(props.permitSettingsStore, 'getBlanketValidityTypes');
      const loadPermitDiplomaticType = sinon.spy(props.permitSettingsStore, 'getPermitDiplomaticTypes');
      const loadPermitNumberExceptions = sinon.spy(props.permitSettingsStore, 'getPermitNumberExceptions');
      const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup).props();
      viewInputControlsGroup.onFocus('appliedPermitPrerequisiteType');
      expect(loadPrerequisiteTypes.called).to.be.true;
      viewInputControlsGroup.onFocus('appliedBlanketValidityType');
      expect(loadBlanketValidityTypes.called).to.be.true;
      viewInputControlsGroup.onFocus('appliedPermitDiplomaticType');
      expect(loadPermitDiplomaticType.called).to.be.true;
      viewInputControlsGroup.onFocus('appliedPermitNumberExceptionType');
      expect(loadPermitNumberExceptions.called).to.be.true;
  });

});
