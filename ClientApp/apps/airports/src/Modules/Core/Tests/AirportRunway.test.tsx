import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { PureAirportRunway } from '../Components/AirportRunway/AirportRunway';
import { AirportRunwayModel, AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';

describe('Airport Runway Component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  const data = new AirportRunwayModel({
    id: 1,
    name: 'TEST',
    airportId: 45,
  });

  const props = {
    classes: {},
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    params: { airportId: 1, icao: 'KHOU' },
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<PureAirportRunway {...props} />).dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });
});
