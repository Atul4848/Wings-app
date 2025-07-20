import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { IconButton } from '@material-ui/core';
import { SelectInputControl } from '@wings-shared/form-controls';
import { ChipInputControl, SearchHeaderV2, SearchInputControl } from '../Components';

describe('Search Header Component', function() {
  let wrapper: ShallowWrapper;
  const onSearch = sinon.fake();
  const onKeyUp = sinon.fake();
  const onClear = sinon.fake();
  const onResetFilterClick = sinon.fake();
  const onExpandCollapse = sinon.fake();
  const onFilterChange = sinon.fake();
  const props = {
    placeHolder: 'Test Placeholder',
    onSearch,
    backButton: <div>Back</div>,
    isChipInputControl: false,
    onKeyUp,
    onClear,
    onResetFilterClick,
    onExpandCollapse,
    selectInputs: [],
    onFilterChange,
  };

  beforeEach(function() {
    wrapper = shallow(<SearchHeaderV2 {...props} />).dive();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should not render the select input controls initially', function() {
    expect(wrapper.find(SelectInputControl)).to.have.length(0);
  });

  it('should call onResetFilterClick when the reset filter button is clicked', function() {
    wrapper
      .find(IconButton)
      .at(0)
      .simulate('click');
    expect(onResetFilterClick.called).to.equal(true);
  });

  it('should render the chip input control when isChipInputControl is true', function() {
    const wrapper = shallow(<SearchHeaderV2 {...props} isChipInputControl={true} />).dive();
    expect(wrapper.find(ChipInputControl)).to.have.length(1);
  });

  it('should call onExpandCollapse when the expand/collapse button is clicked', function() {
    wrapper
      .find(IconButton)
      .at(1)
      .simulate('click');
    expect(onExpandCollapse.called).to.equal(true);
  });

  it('should call onKeyUp when a key is pressed in the search input control', function() {
    wrapper.find(SearchInputControl).prop('onKeyUp')('Enter');
    expect(onKeyUp.calledWith('Enter')).to.equal(true);
  });

  it('should call onClear when the clear button is clicked in the search input control', function() {
    wrapper.find(SearchInputControl).prop('onClear')();
    expect(onClear.called).to.equal(true);
  });
});
