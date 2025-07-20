import * as React from 'react';
import * as sinon from 'sinon';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SelectOption } from '../Models';
import { SettingCategoryControl } from '../Components';

describe('Aircraft Setting Select Component', function() {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;

  const props = {
    classes: {},
    title: 'setting',
    value: 1,
    selectOptions: [ new SelectOption({ name: 'Test', value: '1' }) ],
    onOptionChange: sinon.spy(),
  };

  beforeEach(function() {
    wrapper = shallow(<SettingCategoryControl {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.be.ok;
  });

});
