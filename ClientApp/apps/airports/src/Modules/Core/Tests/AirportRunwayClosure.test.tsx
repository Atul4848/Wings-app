
import { AgGridTestingHelper } from '@wings/shared';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { AirportRunwayClosure } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('Airport Runway Closure Component', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AirportRunwayClosure {...props} />).dive()
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper.length).to.eq(1)
  });

  it('should render CustomAgGridReact and SearchHeaderV3', () => {
    expect(wrapper.find(CustomAgGridReact).length).to.eq(1);
    expect(wrapper.find(SearchHeaderV3).length).to.eq(1);
  });
});
