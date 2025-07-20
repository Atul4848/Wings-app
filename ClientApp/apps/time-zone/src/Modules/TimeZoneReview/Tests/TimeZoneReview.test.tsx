
import { AgGridTestingHelper } from '@wings/shared';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { TimeZoneReviewStoreMock } from '../../Shared';
import TimeZoneReview from '../TimeZoneReview';

describe('Time Zone Review', () => {
  let agGridHook;
  let addNewItemsStub;
  let agGridHelper: AgGridTestingHelper;
  let wrapper;

  const props = {
    timeZoneReviewStore: new TimeZoneReviewStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    agGridHook = sinon.stub();
    addNewItemsStub = sinon.stub();
    wrapper = mount(
      <MemoryRouter>
        <TimeZoneReview {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
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
