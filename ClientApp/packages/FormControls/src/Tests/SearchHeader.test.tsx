import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SelectOption } from '@wings-shared/core';
import { ChipInputControl, PureSearchHeader, SearchInputControl, SelectInputControl } from '../Components';
import { IconButton } from '@material-ui/core';

describe('Search Header Component', function() {
  let wrapper: ShallowWrapper;
  let instance;
  const expandCollapse = sinon.fake();
  const onResetFilterClick = sinon.fake();
  const onSearch = sinon.fake();
  const onSearchTypeChange = sinon.fake();
  const onChipAddOrRemove = sinon.fake();
  const onKeyUp = sinon.fake();
  const onClear = sinon.fake();
  const props = {
    classes: {},
    searchTypeValue: 'test',
    searchTypeOptions: [ new SelectOption({ name: 'Test', value: 'Test' }) ],
    onSearch,
    onSearchTypeChange,
    backButton: <div>Back</div>,
    isChipInputControl: false,
    onChipAddOrRemove,
    onKeyUp,
  };

  beforeEach(function() {
    wrapper = shallow(<PureSearchHeader {...props} />);
    instance = wrapper.instance();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render right content', function() {
    wrapper.setProps({ rightContent: <div>TEST</div> });
    wrapper.update();
    expect(wrapper.text().includes('TEST')).to.be.true;
  });

  it('should call onSearch with test value', function() {
    wrapper.find(SearchInputControl).prop('onSearch')('test');
    expect(onSearch.calledWith('test')).to.be.true;
  });

  it('should call onOptionChange with test value', function() {
    wrapper.find(SelectInputControl).prop('onOptionChange')('test');
    expect(onSearchTypeChange.calledWith('test')).to.be.true;
  });

  it('should call onSearch with ChipInputControl', function() {
    wrapper.setProps({ isChipInputControl: true });
    wrapper.find(ChipInputControl).simulate('chipAddOrRemove');
    expect(onChipAddOrRemove.called).to.be.true;
  });

  it('should not rendered select input control', function() {
    wrapper.setProps({ isHideSearchSelectControl: true });
    expect(wrapper.find(SelectInputControl)).to.have.length(0);
  });

  it('should call clearInputValue when onOptionChange is called', function() {
    const searchInputFake = sinon.fake();
    const chipInputFake = sinon.fake();
    instance.searchInputRef = { current: { clearInputValue: searchInputFake } };
    instance.chipInputRef = { current: { clearInputValue: chipInputFake } };

    wrapper.find(SelectInputControl).prop('onOptionChange')('abc');
    expect(searchInputFake.called).to.be.true;
    expect(chipInputFake.called).to.be.true;
  });

  it('should render the expand/collapse button', function() {
    const expandCollapse = sinon.fake();
    wrapper.setProps({ expandCollapse });
    wrapper.update();
    expect(
      wrapper
        .find(IconButton)
        .at(0)
        .exists()
    ).to.be.true;
    wrapper
      .find(IconButton)
      .at(0)
      .simulate('click');
    expect(expandCollapse.called).to.be.true;
  });

  it('should reset search input', function() {
    const resetSearchInput = sinon.fake();
    const clearInputValue = sinon.fake();
    instance.searchInputRef = { current: { clearInputValue } };
    wrapper.setProps({ isChipInputControl: false });
    wrapper.setProps({
      onSearchTypeChange,
      expandCollapse,
      onResetFilterClick,
      isChipInputControl: false,
      onClear: resetSearchInput,
    });
    wrapper.update();
    instance.resetSearchInput();
    expect(clearInputValue.called).to.be.true;
  });
  it('should set search value', function() {
    const setSearchValue = sinon.fake();
    const setInputValue = sinon.fake();
    instance.searchInputRef = { current: { setInputValue } };
    wrapper.setProps({ isChipInputControl: false });
    wrapper.setProps({
      onSearchTypeChange,
      expandCollapse,
      onResetFilterClick,
      isChipInputControl: false,
      onClear,
      onSearch,
      setSearchValue,
    });
    wrapper.update();
    instance.setSearchValue('test search');
    expect(setInputValue.calledWith('test search')).to.be.true;
  });
  it('should not render other select control when isOtherSelectControl is false', function() {
    wrapper.setProps({ isOtherSelectControl: false });
    expect(
      wrapper
        .find(SelectInputControl)
        .at(1)
        .exists()
    ).to.be.false;
  });

  it('should render other select control when isOtherSelectControl is true', function() {
    wrapper.setProps({
      isOtherSelectControl: true,
      otherSearchTypeOptions: [ new SelectOption({ name: 'Other', value: 'Other' }) ],
      otherSearchTypeValue: 'Other',
    });
    expect(
      wrapper
        .find(SelectInputControl)
        .at(1)
        .exists()
    ).to.be.true;
    expect(
      wrapper
        .find(SelectInputControl)
        .at(1)
        .prop('value')
    ).to.equal('Other');
  });
  it('should call onKeyUp with the correct key when a key is pressed in SearchInputControl', function() {
    wrapper.setProps({ isChipInputControl: false });
    wrapper.find(SearchInputControl).prop('onKeyUp')('Enter');
    expect(onKeyUp.calledWith('Enter')).to.be.true;
  });
});
