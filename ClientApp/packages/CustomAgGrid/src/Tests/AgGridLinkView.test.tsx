import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridLinkView } from '../Components';

describe('AgGridLinkView Component', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;

  const props = {
    classes: {},
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridLinkView {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should refresh agGridLinkView', () => {
    expect(wrapperInstance.refresh()).to.eq(true);
  });

  it('should return a object with getGui method', () => {
    wrapperInstance.viewRendererRef = { current: 'TEST' };
    expect(wrapperInstance.getGui()).to.eq('TEST');
  });
});
