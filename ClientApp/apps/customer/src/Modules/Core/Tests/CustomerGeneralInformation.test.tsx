import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CustomerGeneralInformation } from '../index';
import { CustomerStoreMock } from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';

describe('CustomerGeneralInformation', () => {
  let wrapper: ShallowWrapper;

  const props = {
    customerStore: new CustomerStoreMock(''),
    title: 'Customer Information',
    onValueChange: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = shallow(<CustomerGeneralInformation {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should return proper field by calling fieldProp', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    const field = viewInputControlsGroup.prop('field')('name');
    expect(field.label).to.eq('Name');
    props.onValueChange('TEST', 'name');
    expect(props.onValueChange.calledWith('TEST', 'name')).to.be.true;
  });
});
