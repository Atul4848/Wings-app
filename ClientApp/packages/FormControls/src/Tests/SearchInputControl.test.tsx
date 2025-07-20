import React, { ChangeEvent } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PureSearchInputControl } from '../Components/SearchInputControl/SearchInputControl';
import { OutlinedInput } from '@material-ui/core';

describe('Search Input Control', function() {
  let wrapper: ShallowWrapper;
  let wrapperInstance: PureSearchInputControl;
  const onSearch = sinon.spy(() => {});
  const props = {
    onSearch,
    classes: {
      formControl: 'test',
    },
  };

  beforeEach(function() {
    wrapper = shallow(<PureSearchInputControl {...props} />);
    wrapperInstance = wrapper.instance() as PureSearchInputControl;
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should trigger Outlined Input change event', function() {
    const event: ChangeEvent<HTMLInputElement> = { target: { value: 'test' } } as ChangeEvent<HTMLInputElement>;
    wrapper.dive().find(OutlinedInput).props().onChange(event);
    expect(wrapperInstance.searchValue).to.eq(event.target.value);
  });

  it('should trigger endAdornment click', function() {
    const instance: PureSearchInputControl = wrapper.instance() as PureSearchInputControl;
    const endAdornment = wrapper.dive().find(OutlinedInput).prop('endAdornment');
    shallow(<div>{endAdornment}</div>)
      .first()
      .childAt(0)
      .props()
      .onClick();

    expect(instance.searchValue).to.eq('');
  });

  it('should clear search value with clearInputValue', function() {
    wrapperInstance.searchValue = 'ABC';
    wrapperInstance.clearInputValue();
    expect(wrapperInstance.searchValue).eq('');
  });
});
