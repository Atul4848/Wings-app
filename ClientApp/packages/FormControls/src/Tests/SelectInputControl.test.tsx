import React, { ChangeEvent } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import SelectInputControl from '../Components/SelectInputControl/SelectInputControl';
import { SelectOption } from '../Models';
import { Select } from '@material-ui/core';

describe('SelectInputControl', () => {
  let wrapper: ShallowWrapper;
  const onOptionChange: sinon.SinonSpy = sinon.spy();

  const props = {
    value: '',
    showEmptyMenu: true,
    onOptionChange,
    selectOptions: [
      new SelectOption({ value: 'test1', name: 'Test1' }),
      new SelectOption({ value: 'test2', name: 'Test2' }),
    ],
  };
  beforeEach(() => {
    wrapper = shallow(<SelectInputControl {...props} />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should trigger default change handler', () => {
    const event: ChangeEvent<HTMLInputElement> = { target: { value: 'test1' } } as ChangeEvent<HTMLInputElement>;
    wrapper.find(Select).props().onChange(event, null);
    expect(onOptionChange.calledWith('test1')).to.be.true;
  });
});
