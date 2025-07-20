import React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportRunwayDetails } from '../Components';
import { useRouterContext } from '@wings/shared';
import sinon from 'sinon';
import { AirportRunwayModel, AirportStoreMock, AirportSettingsStoreMock } from '../../Shared';
import {
  Collapsable,
  ConfirmDialog,
  DetailsEditorHeaderSection,
  DetailsEditorWrapper,
  SidebarStore,
} from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { ViewInputControl } from '@wings-shared/form-controls';
import { ModalStore } from '@uvgo-shared/modal-keeper';

describe('Runway DetailsV2 Component', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const data = new AirportRunwayModel({
    id: 1,
    name: 'Chandigarh',
    airportId: 798,
  });

  const props = {
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AirportRunwayDetails {...props} />
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
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(Collapsable)).to.have.length(3);
  });

  it('onAction should call upsertRunway on SAVE action', () => {
    const upsertRunwaySpy = sinon.spy(props.airportStore, 'upsertRunway');
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertRunwaySpy.called).true;
  });

  it('onAction should call confirmClose on CANCEL action', () => {
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.CANCEL);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.be.ok;
  });

  it('should test onFocus with different fields', () => {
    const viewInputControl = wrapper.find(ViewInputControl);

    //with runwaySurfaceTreatment field
    const surfaceTreatmentSpy = sinon.spy(props.airportSettingsStore, 'loadRunwaySurfaceTreatments');
    viewInputControl.at(6).prop('onFocus')('runwaySurfaceTreatment');
    expect(surfaceTreatmentSpy.called).to.be.true;

    //with runwaySurfacePrimaryType field
    //with runwaySurfaceSecondaryType field
    const loadRunwaySurfaceTypes = sinon.spy(props.airportSettingsStore, 'loadRunwaySurfaceTypes');
    viewInputControl.at(7).prop('onFocus')('runwaySurfacePrimaryType');
    viewInputControl.at(8).prop('onFocus')('runwaySurfaceSecondaryType');
    expect(loadRunwaySurfaceTypes.called).to.be.true;

    //with runwayLightType field
    const loadRunwayLightTypes = sinon.spy(props.airportSettingsStore, 'loadRunwayLightTypes');
    viewInputControl.at(9).prop('onFocus')('runwayLightType');
    expect(loadRunwayLightTypes.called).to.be.true;

    //with runwayCondition field
    const loadRunwayConditions = sinon.spy(props.airportSettingsStore, 'loadRunwayConditions');
    viewInputControl.at(10).prop('onFocus')('runwayCondition');
    expect(loadRunwayConditions.called).to.be.true;

    //with runwayUsageType field
    const loadRunwayUsageTypes = sinon.spy(props.airportSettingsStore, 'loadRunwayUsageTypes');
    viewInputControl.at(11).prop('onFocus')('runwayUsageType');
    expect(loadRunwayUsageTypes.called).to.be.true;

    //with appliedRunwayRVRs field
    const loadRunwayRVR = sinon.spy(props.airportSettingsStore, 'loadRunwayRVR');
    viewInputControl.at(23).prop('onFocus')('appliedRunwayRVRs');
    expect(loadRunwayRVR.called).to.be.true;

    //with runwayApproachLight field
    const loadRunwayApproachLight = sinon.spy(props.airportSettingsStore, 'loadRunwayApproachLight');
    viewInputControl.at(92).prop('onFocus')('runwayApproachLight');
    expect(loadRunwayApproachLight.called).to.be.true;

    //with runwayVGSI field
    const loadRunwayVGSI = sinon.spy(props.airportSettingsStore, 'loadRunwayVGSI');
    viewInputControl.at(95).prop('onFocus')('runwayVGSI');
    expect(loadRunwayVGSI.called).to.be.true;

    //with appliedRunwayApproachTypes field
    const loadRunwayApproachType = sinon.spy(props.airportSettingsStore, 'loadRunwayApproachType');
    viewInputControl.at(98).prop('onFocus')('appliedRunwayApproachTypes');
    expect(loadRunwayApproachType.called).to.be.true;

    //with appliedRunwayNavaids field
    const loadRunwayNavaids = sinon.spy(props.airportSettingsStore, 'loadRunwayNavaids');
    viewInputControl.at(101).prop('onFocus')('appliedRunwayNavaids');
    expect(loadRunwayNavaids.called).to.be.true;

    //with accessLevel field
    const getAccessLevels = sinon.spy(props.airportSettingsStore, 'getAccessLevels');
    viewInputControl.at(12).prop('onFocus')('accessLevel');
    expect(getAccessLevels.called).to.be.true;

    //with sourceType field
    const getSourceTypes = sinon.spy(props.airportSettingsStore, 'getSourceTypes');
    viewInputControl.at(13).prop('onFocus')('sourceType');
    expect(getSourceTypes.called).to.be.true;
  });

  it('should test onValueChange', () => {
    const inputControl = wrapper.find(ViewInputControl).at(0);
    inputControl.prop('onValueChange')('Test', 'runwayId');
    expect(inputControl.prop('field').value).to.eq('Test');
  });
});
