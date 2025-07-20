import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PureAgGridPopover } from '../Components/AgGridPopover/AgGridPopover';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import { EDITOR_TYPES } from '@wings-shared/form-controls';

describe('AgGrid Popover', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance;

  const props = {
    endAdornmentIcon: <div>test</div>,
    popperContent: <div>new test</div>,
    onOkClick: sinon.fake(),
    onCancelClick: sinon.fake(),
    value: 'testing',
    multiline: false,
    isDisabled: false,
    classes: {},
  };

  beforeEach(() => {
    wrapper = shallow(<PureAgGridPopover {...props} />);
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onPopperClick with Cancel Button in popperContent', () => {
    const onPopperClickCancelSpy = sinon.spy(wrapperInstance, 'onPopperCancelClick');
    wrapper.find(PrimaryButton).simulate('click');
    expect(onPopperClickCancelSpy.calledOnce).to.be.true;
  });

  it('should call onPopperClick with OK Button in popperContent', () => {
    const onPopperClickOkSpy = sinon.spy(wrapperInstance, 'onPopperOkClick');
    wrapper.find(SecondaryButton).simulate('click');
    expect(onPopperClickOkSpy.calledOnce).to.be.true;
  });

  it('should call popover on endAdornment click', () => {
    const onEndAdornmentClickSpy = sinon.spy(wrapperInstance, 'onEndAdornmentClick');
    wrapperInstance.onEndAdornmentClick({ currentTarget: <div /> });
    expect(onEndAdornmentClickSpy.calledOnce).to.be.true;
  });

  it('should call popover on cancel click', () => {
    wrapper.setProps({ readOnly: true, value: 'Test' });
    const onEndAdornmentClickSpy = sinon.spy(wrapperInstance, 'onEndAdornmentClick');
    wrapper.find(IconButton).simulate('click', { currentTarget: <div /> });
    expect(onEndAdornmentClickSpy.calledOnce).to.be.true;
  });

  it('should call popover on close', () => {
    wrapperInstance.isOpen = true;
    wrapper.find(Popover).simulate('close');
    expect(wrapperInstance.isOpen).to.be.false;
  });

  it('component should render rich text editor with read only', () => {
    wrapper.setProps({ editorType: EDITOR_TYPES.RICH_TEXT_EDITOR, readOnly: true, value: 'TEST' });
    expect(wrapperInstance.contentValueRenderer).not.null;
  });
});
