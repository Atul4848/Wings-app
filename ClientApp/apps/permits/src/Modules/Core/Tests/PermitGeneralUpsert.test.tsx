import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { PermitSettingsStoreMock, PermitStoreMock } from '../../Shared';
import { useRouterContext, VIEW_MODE } from '@wings/shared';
import { SidebarStore } from '@wings-shared/layout';
import { PermitGeneralUpsert, PermitGroupViewInputControls } from '../Components';
import { Provider } from 'mobx-react';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Permit General Upsert Component', () => {
  let wrapper: any;

  const props = {
    classes: {},
    navigate: sinon.spy(),
    sidebarStore: SidebarStore,
    permitSettingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(),
    params: { permitId: 1, viewMode: VIEW_MODE.EDIT },
    fields: 'permitType',
  };

  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <PermitGeneralUpsert {...props} />
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

  it('should call onValueChange function with ViewInputControls', () => {
    const viewInputControls = wrapper.find(PermitGroupViewInputControls).props();
    expect(viewInputControls).to.have.property('onValueChange');
    viewInputControls.onValueChange({ id: 2, name: 'test' }, 'permitApplied.permitAppliedTo');
    expect(props.permitStore.permitDataModel.permitApplied.permitAppliedTo).to.exist;
    viewInputControls.onValueChange(null, 'country');
    viewInputControls.onValueChange(null, 'permitApplied.isPolygon');
    expect(props.permitStore.permitDataModel.permitApplied.isPolygon).to.equal(false);
    viewInputControls.onValueChange({ id: 2, name: 'test' }, 'permitType');  
    viewInputControls.onValueChange(false, 'hasRouteOrAirwayExtension');
    expect(props.permitStore.permitDataModel.hasRouteOrAirwayExtension).to.equal(false);
  });
  
});
