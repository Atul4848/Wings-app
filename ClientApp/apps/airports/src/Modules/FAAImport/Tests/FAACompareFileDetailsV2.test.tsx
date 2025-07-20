import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { GridApiMock, IGridApi } from '@wings/shared';
import { AirportSettingsStoreMock, AirportStoreMock, FAA_IMPORT_STAGING_ENTITY_TYPE } from '../../Shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import FAACompareFileDetailsV2 from '../FAACompareFileDetails/FAACompareFileDetailsV2';

describe('FAACompareFileDetailsV2 Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  let state: any;

  const props = {
    state,
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
    entityType: FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT,
    airportSettingsStore: new AirportSettingsStoreMock(),
    isRunwayBySourceLocation: false,
  };

  beforeEach(() => {
    gridApi = new GridApiMock();
    wrapper = shallow(<FAACompareFileDetailsV2 {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });
});
