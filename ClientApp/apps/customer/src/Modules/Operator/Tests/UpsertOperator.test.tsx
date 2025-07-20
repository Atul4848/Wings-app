import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { OperatorStoreMock } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import { UpsertOperator } from '../Components';

describe('UpsertOperator', () => {
  let wrapper: ShallowWrapper;

  const props = {
    operatorStore: new OperatorStoreMock(''),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<UpsertOperator basePath={''} {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
