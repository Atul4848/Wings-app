import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridReact as AgGridReactComponent, AgGridReactProps } from 'ag-grid-react';
import TablePagination from '@material-ui/core/TablePagination';
import sinon from 'sinon';
import AgGridReact from './../AgGridReact';
describe('AgGridReact module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const onPaginationChange = sinon.fake();

  const props = {
    onPaginationChange,
    hidePagination: false,
    classes: {},
    serverPagination: false,
    hidePagination: false,
    paginationData: {
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 0,
    },
    disabledNextIcon: true,
  };

  beforeEach(function() {
    wrapper = shallow(<AgGridReact {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('renders AgGridReact with correct initial state', function() {
    expect(instance.totalNumberOfRecord).to.equal(props.paginationData.totalNumberOfRecords);
    //expect(instance.pageNumber).to.equal(props.paginationData.pageNumber);
  });

  it('does not call onPaginationChange initially', function() {
    expect(onPaginationChange.called).to.be.false;
  });

  it('renders AgGridReact with correct pagination props', function() {
    const agGridProps = wrapper.find(AgGridReactComponent).props();
    expect(agGridProps.pagination).to.be.true;
    expect(agGridProps.suppressPaginationPanel).to.be.true;
  });

  it('disables backIconButtonProps', function() {
    const lastPageProps = {
      ...props,
      serverPagination: false,
      paginationData: { pageNumber: 2, pageSize: 30, totalNumberOfRecords: 60 },
    };
    wrapper.setProps(lastPageProps);
    expect(wrapper.find(TablePagination).prop('backIconButtonProps').disabled).to.be.true;
  });

  it('enable backIconButtonProps', function() {
    const lastPageProps = {
      ...props,
      serverPagination: true,
      paginationData: { pageNumber: 2, pageSize: 30, totalNumberOfRecords: 60 },
    };
    wrapper.setProps(lastPageProps);
    expect(wrapper.find(TablePagination).prop('backIconButtonProps').disabled).to.be.false;
  });

  it('does not call onPaginationChange in server pagination mode when page is changed', function() {
    const serverPaginationProps = {
      ...props,
      serverPagination: false,
      paginationData: { pageNumber: 2, pageSize: 30, totalNumberOfRecords: 100 },
    };
    wrapper.setProps(serverPaginationProps as any);
    wrapper.find(TablePagination).prop('onPageChange')(null, 3);
    expect(onPaginationChange.called).to.be.false;
  });

  it('enables nextIconButtonProps when there are more pages', function() {
    const morePagesProps = {
      ...props,
      serverPagination: true,
      paginationData: { pageNumber: 1, pageSize: 30, totalNumberOfRecords: 90 },
    };
    wrapper.setProps(morePagesProps);
    expect(wrapper.find(TablePagination).prop('nextIconButtonProps').disabled).to.be.false;
  });

  it('disable nextIconButtonProps when page number and total number of records are same', function() {
    const morePagesProps = {
      ...props,
      serverPagination: true,
      paginationData: { pageNumber: 90, pageSize: 30, totalNumberOfRecords: 90 },
    };
    wrapper.setProps(morePagesProps);
    expect(wrapper.find(TablePagination).prop('nextIconButtonProps').disabled).to.be.true;
  });

  it('disables backIconButtonProps when on the first page', function() {
    const firstPageProps = {
      ...props,
      paginationData: { pageNumber: 1, pageSize: 30, totalNumberOfRecords: 60 },
    };
    wrapper.setProps(firstPageProps);
    expect(wrapper.find(TablePagination).prop('backIconButtonProps').disabled).to.be.true;
  });

  it('calls onPaginationChange when rows per page is changed in server pagination mode', function () {
    const serverPaginationProps = {
      ...props,
      serverPagination: true,
    };
    wrapper.setProps(serverPaginationProps);
    wrapper.find(TablePagination).prop('onRowsPerPageChange')({
      target: { value: '50' },
    } as React.ChangeEvent<HTMLInputElement>);
    expect(onPaginationChange.calledOnce).to.be.true;
    expect(onPaginationChange.firstCall.args[0]).to.deep.equal({
      pageNumber: 1,
      pageSize: 50,
    });
  });
});
