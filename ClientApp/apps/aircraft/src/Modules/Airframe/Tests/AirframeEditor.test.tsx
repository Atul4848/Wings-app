import React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { BaseCustomerStore, useRouterContext, VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import {
  FlightPlanStoreMock,
  SettingsStoreMock,
  AirframeStoreMock,
  AircraftVariationStoreMock,
  AvionicsSettingsStoreMock,
  PerformanceStoreMock,
  AirframeEditor,
} from '../../index';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EditSaveButtons, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('AirframeEditor module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const flightPlanStore = new FlightPlanStoreMock();
  const settingsStore = new SettingsStoreMock();
  const airframeStore = new AirframeStoreMock();
  const aircraftVariationStore = new AircraftVariationStoreMock();
  const avionicsSettingsStore = new AvionicsSettingsStoreMock();
  const performanceStore = new PerformanceStoreMock();

  const props = {
    airframeStore,
    settingsStore,
    aircraftVariationStore,
    performanceStore,
    customerStore: BaseCustomerStore,
    params: { mode: VIEW_MODE.EDIT, id: 1 },
    navigate: sinon.fake(),
    sidebarStore: SidebarStore,
  };

  const element = <AirframeEditor {...props} />;

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
