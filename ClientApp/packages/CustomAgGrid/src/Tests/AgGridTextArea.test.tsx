import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridPopover, AgGridTextArea } from '../Components';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { EDITOR_TYPES } from '@wings-shared/form-controls';

describe('AgGridTextArea', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance;
  let popperContent: ShallowWrapper;
  const focus: sinon.SinonSpy = sinon.mock();
  const theme = createTheme(LightTheme);
  const getEditableState = sinon.fake();
  const onInputChange = sinon.fake();
  const props = {
    theme,
    getEditableState,
    classes: {},
    value: 'test',
    readOnly: true,
    context: { componentParent: { onInputChange } },
    colDef: { headerName: 'test' },
  };

  const mountComponent = function(props: {} = {}) {
    wrapper = shallow(<AgGridTextArea {...props} />).dive();
    wrapperInstance = wrapper.instance();
    popperContent = shallow(<div>{wrapperInstance.popperContent}</div>);
    wrapperInstance.afterGuiAttached();
  };

  beforeEach(() => {
    mountComponent(props);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should get value', () => {
    const value: string = wrapperInstance.getValue();
    expect(value).to.eq('test');
  });

  it('should isCancelAfterEnd', () => {
    expect(wrapperInstance.isCancelAfterEnd()).to.be.false;
  });

  it('should changed value and focused in ', () => {
    mountComponent({ ...props, value: '' });
    const value: string = wrapperInstance.getValue();
    expect(value).to.eq('');
  });

  it('should focus', () => {
    wrapperInstance.focusIn();
    expect(focus.called).not.to.be.true;
  });

  it('should be refreshed', () => {
    expect(wrapperInstance.refresh('')).to.true;
  });

  it('should call onPopperClick with Cancel Button in popperContent', () => {
    const onPopperClickCancelSpy = sinon.spy(wrapperInstance, 'onPopperCancelClick');
    wrapper.find(AgGridPopover).simulate('cancelClick');
    expect(onPopperClickCancelSpy.calledOnce).to.be.true;
  });

  it('should call onPopperClick with OK Button in popperContent', () => {
    const onPopperClickOkSpy = sinon.spy(wrapperInstance, 'onPopperOkClick');
    wrapper.find(AgGridPopover).simulate('okClick');
    expect(onPopperClickOkSpy.calledOnce).to.be.true;
  });

  it('should call onPopperClick with OK Button in popperContent without onParentChange Handler', () => {
    wrapper.setProps({ context: { componentParent: {} } });
    const onPopperClickOkSpy = sinon.spy(wrapperInstance, 'onPopperOkClick');
    wrapper.find(AgGridPopover).simulate('okClick');
    expect(onPopperClickOkSpy.calledOnce).to.be.true;
  });

  it('component should be read only', () => {
    wrapper.setProps({ getReadOnlyState: () => true, readOnly: false });
    expect(wrapperInstance.isReadOnly).to.be.true;
  });

  it('component should render rich text editor with read only', () => {
    wrapper.setProps({ editorType: EDITOR_TYPES.RICH_TEXT_EDITOR, readOnly: true });
    expect(wrapperInstance.popperContent).not.null;
  });
});
