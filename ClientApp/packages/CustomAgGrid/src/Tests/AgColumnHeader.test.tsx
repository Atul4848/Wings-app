import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SORTING_DIRECTION } from '@wings-shared/core';
import { PureAgColumnHeader } from '../Components/AgColumnHeader/AgColumnHeader';

describe('Ag Custom column header component', () => {
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
      addEventListener: sinon.fake(),
      removeEventListener: sinon.fake(),
    }),
    getParent: () => ({
      getGroupId: () => '',
      getOriginalColumnGroup: () => ({
        getOriginalParent: () => ({
          addEventListener: sinon.fake(),
          removeEventListener: sinon.fake(),
        }),
      }),
    }),
  };

  const props = {
    classes: {},
    column,
    enableSorting: true,
    enableMenu: true,
    setSort: sinon.fake(),
    showColumnMenu: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureAgColumnHeader {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
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
