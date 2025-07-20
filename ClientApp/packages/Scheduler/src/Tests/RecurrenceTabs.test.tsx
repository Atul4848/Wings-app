import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Tab } from '@material-ui/core';
import { RecurrenceTabs } from '../Components';
import { expect } from 'chai';
import sinon from 'sinon';

describe('CustomTabs Component', () => {
  let wrapper: ShallowWrapper;
  const onTabChange = sinon.fake();

  const props = {
    activeTab: 0,
    tabs: ['a', 'b'],
    classes: {},
    onTabChange,
  };

  beforeEach(() => {
    wrapper = shallow(
      <RecurrenceTabs {...props}>
        <div>A</div>
        <div>B</div>
      </RecurrenceTabs>
    ).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should change tab Properly', () => {
    wrapper.find(Tab).first().simulate('click', 0, 'a');
    expect(onTabChange.calledWith(0, 'a')).to.be.true;
  });
});
