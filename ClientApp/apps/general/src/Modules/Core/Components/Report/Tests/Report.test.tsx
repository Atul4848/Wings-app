import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import Report from '../Report';
import { GridApiMock } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ReportSummaryModel } from '../../../../Shared';
import { ReportSummaryStoreMock } from '../../../../Shared/Mocks/ReportSummary.mock';

describe('Report Summary', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const reportSummary = new ReportSummaryModel({
    appName: 'User API',
  });

  const columnApi = {
    setColumnGroupOpened: sinon.fake(),
  };

  const props = {
    reportSummaryStore: new ReportSummaryStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<Report {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: reportSummary });
    instance.columnApi = columnApi;
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });
});
