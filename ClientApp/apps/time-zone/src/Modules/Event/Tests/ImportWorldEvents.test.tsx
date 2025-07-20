import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import ImportWorldEvents from '../ImportWorldEvents/ImportWorldEvents';
import { AgGridTestingHelper } from '@wings/shared';
import { EventStoreMock } from '../../Shared/Mocks';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('ImportWorldEvents Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  let eventStore = new EventStoreMock();
  const sidebarStoreMock = { setNavLinks: sinon.fake() };

  const props = {
    eventStore,
    sidebarStore: sidebarStoreMock,
  };

  beforeEach(() => {
    wrapper = shallow(<ImportWorldEvents {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without error', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });
});
