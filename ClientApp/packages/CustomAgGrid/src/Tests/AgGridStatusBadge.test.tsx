import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import { AgGridStatusBadge } from '../Components';
import { IBaseEditorProps, STATUS_BADGE_TYPE } from '@wings-shared/custom-ag-grid';
import { StatusBadge } from '@uvgo-shared/status-badges';
describe('AgGridStatusBadge Component', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  let props: IBaseEditorProps;
  beforeEach(() => {
    props = {
      ...props,
      value: 'new',
    };
    wrapper = shallow(<AgGridStatusBadge {...props} />);
    wrapperInstance = wrapper.instance();
  });
  afterEach(() => wrapper.unmount());
  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
  it('should render StatusBadge component with the correct type for "completed" status', () => {
    wrapper.setProps({ value: 'completed' });
    const statusBadge = wrapper.find(StatusBadge);
    expect(statusBadge).to.have.length(1);
    expect(statusBadge.prop('type')).to.equal(STATUS_BADGE_TYPE.ACCEPTED);
  });
  it('should render StatusBadge component with the correct type for "failure" status', () => {
    wrapper.setProps({ value: 'failure' });
    const statusBadge = wrapper.find(StatusBadge);
    expect(statusBadge).to.have.length(1);
    expect(statusBadge.prop('type')).to.equal(STATUS_BADGE_TYPE.REJECTED);
  });
  it('should render StatusBadge component with the correct type for "warning" status', () => {
    wrapper.setProps({ value: 'warning' });
    const statusBadge = wrapper.find(StatusBadge);
    expect(statusBadge).to.have.length(1);
    expect(statusBadge.prop('type')).to.equal(STATUS_BADGE_TYPE.UNDECIDED);
  });
  it('should render StatusBadge component with the correct type for "processing" status', () => {
    wrapper.setProps({ value: 'processing' });
    const statusBadge = wrapper.find(StatusBadge);
    expect(statusBadge).to.have.length(1);
    expect(statusBadge.prop('type')).to.equal(STATUS_BADGE_TYPE.PROGRESS);
  });
  it('should render StatusBadge component with the correct type for "warning" status', () => {
    wrapper.setProps({ value: 'test' });
    const statusBadge = wrapper.find(StatusBadge);
    expect(statusBadge).to.have.length(1);
    expect(statusBadge.prop('type')).to.equal(STATUS_BADGE_TYPE.INITIAL);
  });
});
