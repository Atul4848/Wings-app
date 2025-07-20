import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { PureAirportRunwayDetails } from '../Components/AirportRunway/AirportRunwayDetails/AirportRunwayDetails';
import { AirportStoreMock, AirportSettingsStoreMock } from '../../Shared/Mocks';
import { VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import sinon from 'sinon';
import { AirportRunwayModel } from '../../Shared';
import { DetailsEditorWrapper, EditSaveButtons, SidebarStore } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Runway Details Component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;

  const data = new AirportRunwayModel({
    id: 1,
    name: 'Chandigarh',
    airportId: 798,
  });

  const props = {
    params: { airportId: 798, icao: 'string', runwayId: 1, runwayViewMode: VIEW_MODE.EDIT },
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    viewMode: VIEW_MODE.EDIT,
    classes: {},
    sidebarStore: SidebarStore,
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureAirportRunwayDetails {...props} />).dive();
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    instance = wrapper.instance();
    instance.runway = data;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should work with onValueChange', () => {
    const getFieldSpy = sinon.spy(instance, 'getField');
    wrapper
      .find(ViewInputControl)
      .at(0)
      .simulate('valueChange', 'test', 'length');
    expect(getFieldSpy.called).to.be.true;
  });
});
