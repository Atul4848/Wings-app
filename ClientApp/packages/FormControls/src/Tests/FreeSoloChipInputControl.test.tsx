import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { expect } from 'chai';
import sinon from 'sinon';
import { FreeSoloChipInputControl } from '../Components';
import { Chip, FormLabel, TextField, withStyles } from '@material-ui/core';
describe('Free Solo Chip Input Control', function() {
  let wrapper: ShallowWrapper;
  let wrapperInstance;
  let autoComplete;
  let formLabel;
  const onChipAddOrRemove = sinon.fake();
  const value = ['test', 'Test1'];
  const props = {
    classes: {
      chip: 'test',
    },
    onChipAddOrRemove,
    field: {
      value,
      label: 'string',
      hasError: false,
    },
    isEditable: true,
    placeHolder: 'test',
    isLeftIndent: true,
    isNumber: false,
  };

  beforeEach(function() {
    wrapper = shallow(<FreeSoloChipInputControl {...props} />);
    wrapperInstance = wrapper.dive().instance();
    autoComplete = wrapper.dive().find(Autocomplete);
    formLabel = wrapper.dive().find(FormLabel);
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render Autocomplete', () => {
    expect(autoComplete).to.have.length(1);
  });

  it('should render FormLabel', () => {
    expect(formLabel).to.have.length(1);
  });

  it('should renderInput', () => {
    const inputNode: Function = autoComplete.prop('renderInput');
    expect(inputNode({ inputProps: 'test' })).not.to.be.null;
  });

  it('should render tags in edit mode', () => {
    const getTagProps = index => ({ index });
    const renderTags: Function = autoComplete.prop('renderTags');
    const renderedTags = renderTags(value, getTagProps);
    expect(renderedTags.length).to.eq(value.length);
  });

  it('should render tags with delete icon', () => {
    const getTagProps = index => ({ index });
    const renderTags: Function = autoComplete.prop('renderTags');
    const renderedTags = renderTags(value, getTagProps);
    renderedTags.forEach((tag, index) => {
      const deleteIcon = tag.props.onDelete;
      expect(deleteIcon).to.be.a('function');
      deleteIcon();
      sinon.assert.calledWith(
        onChipAddOrRemove,
        value.filter((_tag, i) => i !== index)
      );
    });
  });

  it('should handle numeric input correctly', () => {
    wrapper.setProps({ ...props, isNumber: true });
    wrapper.update();
    wrapperInstance.textInputValue = '123';
    wrapperInstance.updateValue();
  });

  it('should clear input after adding a chip', () => {
    wrapperInstance.textInputValue = 'NewChip';
    wrapperInstance.updateValue();
    expect(wrapperInstance.textInputValue).to.equal('');
  });
});
