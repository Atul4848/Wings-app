import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import TabList from '@material-ui/lab/TabList';
import { TabScrollButton } from '@material-ui/core';
import { TabsLayout } from '../Components';

describe('Tabs Layout Module', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const onTabChange = sinon.fake();
  const props = {
    classes: {},
    activeTab: 'Territory',
    onTabChange,
    tabs: ['Territory', 'State'],
  };

  beforeEach(() => {
    wrapper = shallow(<TabsLayout {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render TabScrollButton', () => {
    const ScrollButtonComponent = wrapper.find(TabList).prop('ScrollButtonComponent');
    expect(shallow(<ScrollButtonComponent />).find(TabScrollButton)).to.have.length(1);

    // should not render if disabled
    expect(shallow(<ScrollButtonComponent disabled={true} />).find(TabScrollButton)).to.have.length(0);
  });

  it('should render TabList', () => {
    expect(wrapper.find(TabList)).to.have.length(1);
  });

  it('should call active tab method', () => {
    wrapper.find(TabList).simulate('change', null, 'State');
    expect(onTabChange.calledOnce).to.be.true;
    expect(onTabChange.calledWith('State')).to.be.true;
  });
});
