import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { useRouterContext } from '@wings/shared';
import { FlightPlanInformation } from '../Components';
import { AirportFlightPlanInfoModel, AirportModel, AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Flight Plan InformationV2 Module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;
  let viewInputControlsGroup;

  const selectedAirport = new AirportModel({
    airportFlightPlanInfo: new AirportFlightPlanInfoModel({ navBlueCode: 'ABC' }),
  });

  const props = {
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <FlightPlanInformation {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    const groupInputControls = viewInputControlsGroup.prop('groupInputControls');
    expect(wrapper).to.have.lengthOf(1);
    expect(groupInputControls[0].inputControls).to.have.lengthOf(10);
  });

  it('should return proper field by calling field Prop', () => {
    const field = viewInputControlsGroup.prop('field')('navBlueCode');
    // should return proper field
    expect(field.label).to.eq('NavBlue Code');
  });

  it('onAction should call upsertAirportFlightPlanInfo on SAVE action', () => {
    const upsertAirportFlightPlanInfoSpy = sinon.spy(props.airportStore, 'upsertAirportFlightPlanInfo');
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertAirportFlightPlanInfoSpy.called).true;
  });

  it('should call onFocus method', () => {
    //else case
    viewInputControlsGroup.prop('onFocus')('fpAirspace');
    expect(props.airportStore.firs).to.be.empty;

    const loadTOFs = sinon.spy(props.airportSettingsStore, 'loadDestinationAlternateTOFs');
    viewInputControlsGroup.prop('onFocus')('appliedDestAltTOFs');
    expect(loadTOFs.calledOnce).to.be.true;
  });

  it('should call onValueChange method', () => {
    viewInputControlsGroup.prop('onValueChange')('Test', 'fplzzzz');
    expect(viewInputControlsGroup.prop('field')('fplzzzzItem18').value).to.eq('');

    //else case
    viewInputControlsGroup.prop('onValueChange')('TEST', 'navBlueCode');
    expect(viewInputControlsGroup.prop('field')('navBlueCode').value).to.eq('TEST');
  });

  it('should call onSearch method', () => {
    //else case
    viewInputControlsGroup.prop('onSearch')('test', 'appliedDestAltTOFs');
    expect(viewInputControlsGroup.prop('field')('appliedDestAltTOFs').value).to.be.empty;

    const getFIRsSpy = sinon.spy(props.airportStore, 'getFIRs');
    viewInputControlsGroup.prop('onSearch')('abc', 'fpAirspace');
    expect(getFIRsSpy.calledOnce).to.be.true;
  });
});
