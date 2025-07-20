import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { AirportHoursModel, AirportHoursStoreMock, AirportSettingsStoreMock } from '../../Shared';
import { VIEW_MODE } from '@wings/shared';
import { AirportHeaderSection, AirportHoursDetails, AirportHoursGrid } from '../Components';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Provider } from 'mobx-react';
import sinon from 'sinon';
import { ExpandCollapseButton } from '@wings-shared/form-controls';

describe('Airport Hours Details V2', () => {
  let wrapper: any;
  const props = {
    params: { airportId: 1, icao: 'KHOU', airportHoursTypeId: 1, viewMode: VIEW_MODE.EDIT },
    isEditable: true,
    viewMode: VIEW_MODE.EDIT,
    airportHoursStore: new AirportHoursStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };
  const reRender = () => wrapper.setProps({ abc: Math.random() });
  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <Provider
          airportHoursStore={props.airportHoursStore}
          airportSettingsStore={props.airportSettingsStore}
          sidebarStore={props.sidebarStore}
        >
          <ThemeProvider theme={createTheme(LightTheme)}>
            <AirportHoursDetails {...props} />
          </ThemeProvider>
        </Provider>
      </MemoryRouter>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should change view mode', () => {
    const airportHeaderSection = wrapper.find(AirportHeaderSection).props();
    const onViewModeChangeSpy = sinon.spy(airportHeaderSection, 'onViewModeChange');
    airportHeaderSection.onViewModeChange('edit');
    expect(onViewModeChangeSpy.called).true;
  });

  it('should call onValuechange function', () => {
    const airportHeaderSection = wrapper.find(AirportHeaderSection).props();
    const onValueChangeSpy = sinon.spy(airportHeaderSection, 'onValueChange');
    airportHeaderSection.onValueChange('airport test', 'airport');
    airportHeaderSection.onValueChange(
      new AirportHoursModel({ id: 1, name: 'Airport Hours Type' }),
      'airportHoursType'
    );
    expect(onValueChangeSpy.called).true;
  });

  it('should call onSearchAirport function', () => {
    const airportHeaderSection = wrapper.find(AirportHeaderSection).props();
    const onSearchAirportSpy = sinon.spy(airportHeaderSection, 'onSearchAirport');
    airportHeaderSection.onSearchAirport('test');
    expect(onSearchAirportSpy.called).true;
  });

  it('should call functions based on hasAirportAndAirportHoursType flag', () => {
    const airportHeaderSection = wrapper.find(AirportHeaderSection).props();
    airportHeaderSection.onValueChange('airport test', 'airport');
    airportHeaderSection.onValueChange('airport test', 'airportHoursType');
    reRender();

    // expand collapse button functions
    const expandCollapseButton = wrapper.find(ExpandCollapseButton).props();
    const onExpandCollapseSpy = sinon.spy(expandCollapseButton, 'onExpandCollapse');
    expandCollapseButton.onExpandCollapse();
    expect(onExpandCollapseSpy.called).true;

    //AirportHoursGrid functions
    const airportHoursGrid = wrapper.find(AirportHoursGrid).props();
    const onSaveChangesSpy = sinon.spy(airportHoursGrid, 'onSaveChanges');
    const onColumnResizedSpy = sinon.spy(airportHoursGrid, 'onColumnResized');
    airportHoursGrid.onSaveChanges(new AirportHoursModel({ id: 1, name: 'Airport Hours Type' }), 1);
    airportHoursGrid.onColumnResized('source');
    expect(onSaveChangesSpy.called).true;
    expect(onColumnResizedSpy.called).true;
  });
});
