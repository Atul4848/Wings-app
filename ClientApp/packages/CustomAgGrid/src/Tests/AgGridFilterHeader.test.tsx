import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import { PureAgGridFilterHeader } from '../Components/AgGridFilterHeader/AgGridFilterHeader';
import sinon from 'sinon';
import { SORTING_DIRECTION } from '@wings-shared/core';

describe('AgGridFilterHeader Component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const column = {
    getColDef: sinon.fake(),
    addEventListener: sinon.fake(),
    removeEventListener: sinon.fake(),
    isSortDescending: sinon.fake(),
    isSortAscending: sinon.fake(),
    isFilterActive: sinon.fake(),
    getOriginalParent: () => ({
      isExpanded: sinon.fake(),
      addEventListener: sinon.fake(),
      removeEventListener: sinon.fake(),
      getGroupId: sinon.fake(),
    }),
    getParent: () => ({
      getGroupId: () => '',
      getOriginalColumnGroup: () => ({
        getColGroupDef: sinon.fake.returns({}),
        getOriginalParent: () => ({
          getGroupId: sinon.fake(),
          isExpanded: sinon.fake(),
          addEventListener: sinon.fake(),
          removeEventListener: sinon.fake(),
        }),
      }),
    }),
  };

  const props = {
    classes: {},
    column,
    columnApi: { setColumnGroupOpened: sinon.fake() },
    enableSorting: true,
    enableMenu: true,
    setSort: sinon.fake(),
    showColumnMenu: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureAgGridFilterHeader {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('mouse enter should make menu visible', () => {
    wrapper.simulate('mouseEnter');
    expect(instance.isMouseHovering).to.eq(true);
  });

  it('mouse leave should make menu invisible', () => {
    wrapper.simulate('mouseleave');
    expect(instance.isMouseHovering).to.eq(false);
  });

  it('should sort column on click', () => {
    const onSortRequestedSpy = sinon.spy(instance, 'onSortRequested');
    wrapper
      .find('div')
      .at(1)
      .simulate('click', { shiftKey: true });
    expect(onSortRequestedSpy.calledWith({ shiftKey: true })).to.be.true;
  });

  it('should sort column on multiple cases', () => {
    instance.sortingState = SORTING_DIRECTION.ASCENDING;
    const onSortRequestedSpy = sinon.spy(instance, 'onSortRequested');
    wrapper
      .find('div')
      .at(1)
      .simulate('click', { shiftKey: true });
    expect(onSortRequestedSpy.calledWith({ shiftKey: true })).to.be.true;

    instance.sortingState = SORTING_DIRECTION.DESCENDING;
    wrapper
      .find('div')
      .at(1)
      .simulate('click', { shiftKey: true });
    expect(onSortRequestedSpy.calledWith({ shiftKey: true })).to.be.true;
  });

  it('should open column menu on click', () => {
    const onMenuClickedSpy = sinon.spy(instance, 'onMenuClicked');
    wrapper
      .find('div')
      .at(2)
      .simulate('click');
    expect(onMenuClickedSpy.called).to.be.true;
  });
});
