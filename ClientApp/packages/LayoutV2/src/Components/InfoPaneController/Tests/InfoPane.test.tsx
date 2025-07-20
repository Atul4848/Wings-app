import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import PureInfoPane from '../InfoPane';
import InfoPaneStore from '../InfoPane.store';
import { Drawer, IconButton } from '@mui/material';
import sinon from 'sinon';

describe('Info Pane module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
  };

  beforeEach(() => {
    InfoPaneStore.open(<div>test</div>);
    wrapper = shallow(<PureInfoPane {...props} />).dive();

    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper.find(Drawer)).to.have.length(1);
  });

  it('Dragger should call mouse down', () => {
    const spy = sinon.spy(instance, 'handleMouseDown');
    wrapper.find('div').at(2).simulate('mouseDown', { clientY: 5 });
    expect(spy.calledOnce).to.be.true;
  });

  it('listener function handleMouseup should disable resize', () => {
    instance.handleMouseUp();
    expect(instance.isResizing).to.be.eq(false);
  });

  it('listener function handleMousemove should set new height', () => {
    instance.isResizing = true;
    instance.handleMouseMove({ clientY: 200 });
    expect(instance.newHeight).to.be.eq(200);
  });

  it('onMinimized should expand the info pane', () => {
    const spy = sinon.spy(instance, 'toggleMinimize');
    wrapper.find(IconButton).at(0).simulate('click');
    expect(spy.calledOnce).to.be.true;
  });

  it('onMaximized should collapse the info pane', () => {
    const spy = sinon.spy(instance, 'toggleMaximize');
    wrapper.find(IconButton).at(1).simulate('click');
    expect(spy.calledOnce).to.be.true;
  });
});
