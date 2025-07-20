import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { GridApiMock } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ExecutionSummaryModel, ExecutionSummaryStoreMock, EXCUTION_SUMMARY, ExecutionEntry } from '../../Shared';
import { PureExecutionSummary } from '../ExecutionSummary';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EventStoreMock } from '@wings/time-zone/src/Modules/Shared';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Execution Summary', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const executionSummary = new ExecutionSummaryModel({
    executionSummaryId: 0,
    message: 'ab',
  });

  const columnApi = {
    setColumnGroupOpened: sinon.fake(),
  };

  const props = {
    executionSummaryStore: new ExecutionSummaryStoreMock(),
    eventStore: new EventStoreMock(),
    params: { eventId: 5 },
  };

  beforeEach(() => {
    wrapper = shallow(<PureExecutionSummary {...props} />).dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: executionSummary });
    instance.columnApi = columnApi;
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render SearchHeader and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(SearchHeader)).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('SearchHeader sets searchValue and it calls gridApi', () => {
    wrapper.find(SearchHeader).simulate('search', 'Testing');
    expect(instance.searchValue).to.equal('Testing');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    wrapper.find(SearchHeader).simulate('searchTypeChange', EXCUTION_SUMMARY.EVENT_GUID);
    expect(instance.selectedOption).to.equal(EXCUTION_SUMMARY.EVENT_GUID);
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.false;
  });

  it('should open modal to preview delivered email content', () => {
    instance.gridActions(GRID_ACTIONS.PREVIEW, 0, { data: new ExecutionEntry() });
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData).to.have.length(1);
  });
});
