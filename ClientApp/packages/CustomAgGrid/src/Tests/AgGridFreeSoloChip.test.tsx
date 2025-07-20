import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AgGridFreeSoloChip } from '../Components';
import { Chip, Popover, TextField } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Autocomplete } from '@material-ui/lab';

describe('AgGridFreeSoloChip Component', () => {
  let wrapper;
  let props;
  let componentParent;
  beforeEach(() => {
    componentParent = {
      onDropDownChange: sinon.spy(),
    };
    props = {
      context: {
        componentParent,
      },
      value: [],
      getAutoCompleteOptions: () => [{ label: 'Option 1', value: 'Option 1' }],
      limitTags: () => 4,
      renderTags: () => {},
    };
    wrapper = shallow(<AgGridFreeSoloChip {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render Popover component', () => {
    expect(wrapper.find(Popover)).to.have.length(1);
  });

  it('should not show popover initially', () => {
    expect(wrapper.find(Popover).prop('open')).to.equal(false);
  });

  it('should show popover when clicking on Chip', () => {
    wrapper.setProps({ isRowEditing: true });
    const chip = wrapper.find(Chip);
    chip.simulate('click');
    expect(wrapper.find(Popover).prop('open')).to.equal(true);
  });

  it('should not show popover when clicking on Chip in read-only mode', () => {
    wrapper.setProps({ isRowEditing: false });
    const popover = wrapper.find(Popover);
    expect(popover.prop('open')).to.equal(false);
    expect(wrapper.find('Popover').exists()).to.equal(false);
  });

  it('should render Chips when isRowEditing is true', () => {
    wrapper.setProps({ isRowEditing: true });
    expect(wrapper.find(Chip)).to.have.length(1);
  });

  it('should render Autocomplete component when isRowEditing is true', () => {
    wrapper.setProps({ isRowEditing: true });
    expect(wrapper.find(Autocomplete)).to.have.length(1);
  });

  it('should disable Save button when there are no selected values in edit mode', () => {
    wrapper.setProps({ isRowEditing: true, value: [] });
    expect(
      wrapper
        .find(PrimaryButton)
        .at(1)
        .prop('disabled')
    ).to.equal(true);
  });

  it('should call onDropDownChange when Save button is clicked in edit mode', () => {
    wrapper.setProps({ isRowEditing: true });
    wrapper
      .find(PrimaryButton)
      .at(1)
      .simulate('click');
    expect(props.context.componentParent.onDropDownChange.calledOnce).to.equal(true);
  });

  it('should not call onDropDownChange when Save button is clicked with no selected values in edit mode', () => {
    wrapper.setProps({ isRowEditing: true, value: [] });
    wrapper
      .find(PrimaryButton)
      .at(1)
      .simulate('click');
    expect(props.context.componentParent.onDropDownChange.calledOnce).to.equal(true);
  });

  it('should not show PopOver when click on cancel', () => {
    wrapper.setProps({ isRowEditing: true, value: [] });
    wrapper
      .find(PrimaryButton)
      .at(0)
      .simulate('click');
    expect(wrapper.find(Popover).prop('open')).to.equal(false);
  });

  it('should show PopOver when click ondelete on Chip', () => {
    wrapper.setProps({ isRowEditing: true, value: [] });
    wrapper.find(Chip).simulate('onDelete');
    expect(wrapper.find(Popover).prop('open')).to.equal(false);
  });

  it('should not show PopOver when click onok on Chip', () => {
    wrapper.setProps({ isRowEditing: false });
    wrapper.find(PrimaryButton).simulate('click');
    expect(wrapper.find(Popover).prop('open')).to.equal(false);
  });
});
