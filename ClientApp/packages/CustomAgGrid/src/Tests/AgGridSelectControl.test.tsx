import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridSelectControl } from '../Components';
import { SelectInputControl } from '@wings-shared/form-controls';
import * as sinon from 'sinon';

describe('AgGridSelectControl Component', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;

  const props = {
    context: { componentParent: {} },
    selectValueFormatter: sinon.fake(),
    disabled: false,
    isBoolean: true,
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridSelectControl {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onOptionChange', () => {
    const onOptionChange = sinon.spy(wrapperInstance, 'onOptionChange');
    wrapper.find(SelectInputControl).simulate('optionChange');
    expect(onOptionChange.calledOnce).to.be.true;
  });
});
