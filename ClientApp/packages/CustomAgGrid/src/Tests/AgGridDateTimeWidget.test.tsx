import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridDateTimeWidget, AgGridPopover } from '../Components';
import { HoursTimeModel } from '@wings-shared/scheduler';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { ViewInputControl } from '@wings-shared/form-controls';
import { IOptionValue } from '@wings-shared/core';

describe('AgGridDateTimeWidget', () => {
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
    classes: { root: 'test' },
    value: new HoursTimeModel({ id: 1 }),
    context: { componentParent: { onInputChange } },
    isStartDateTime: false,
    isTimeOnly: () => true,
    colDef: { headerName: 'Test' },
  };

  const valueChange = (index: number, value: IOptionValue, fieldKey: string) =>
    popperContent
      .find(ViewInputControl)
      .at(index)
      .simulate('valueChange', value, fieldKey);

  const mountComponent = function(props: {} = {}) {
    wrapper = shallow(<AgGridDateTimeWidget {...props} />).dive();
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
    // In case of End DateTime
    expect(wrapper).to.have.length(1);

    // In case of Start Datetime
    wrapper.setProps({ isStartDateTime: true, isTimeOnly: () => false });
    expect(wrapper).to.have.length(1);
  });

  it('should get value', () => {
    const hoursTime: HoursTimeModel = wrapperInstance.getValue();
    expect(hoursTime.id).to.eq(1);
  });

  it('should changed value and focused in ', () => {
    mountComponent({ ...props, value: null });
    const hoursTime: HoursTimeModel = wrapperInstance.getValue();
    expect(hoursTime.id).to.eq(0);
  });

  it('should focus', () => {
    wrapperInstance.focusIn();
    expect(focus.called).not.to.be.true;
  });

  it('should be refreshed', () => {
    expect(wrapperInstance.refresh('')).to.true;
  });

  it('should update solar time', () => {
    valueChange(1, 'TEST', null);
    expect(wrapperInstance.getField('solarTime').value).to.eq('TEST');
  });

  it('should reset time and offSet on change of solarTime', () => {
    wrapperInstance.getField('time').set('TEST');
    wrapperInstance.getField('offSet').set(-1);
    wrapperInstance.onValueChange(1, 'solarTime');
    expect(wrapperInstance.getField('time').value).to.be.empty;
    expect(wrapperInstance.getField('offSet').value).to.be.empty;
  });

  it('should call onPopperClick with Cancel Button in popperContent', () => {
    const onPopperClickCancelSpy = sinon.spy(wrapperInstance, 'onPopperCancelClick');
    wrapper.find(AgGridPopover).simulate('cancelClick', new HoursTimeModel({ id: 5 }));
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
});
