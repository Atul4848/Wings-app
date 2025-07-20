import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgGridTextField } from '../Components';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { PureAgGridCellEditor } from '../Components/AgGridCellEditor/AgGridCellEditor';

describe('AgGridCellEditor', () => {
  let wrapper: ShallowWrapper;
  const onInputChange = sinon.fake();
  const onInputBlur = sinon.fake();
  let wrapperInstance: any; // Need any to test private methods
  const theme = createTheme(LightTheme);
  const props = {
    theme,
    classes: {},
    cellStartedEdit: true,
    value: 10,
    rules: 'required',
    context: { componentParent: {} },
  };

  const mountComponent = (props: {} = {}) => {
    wrapper = shallow(<PureAgGridCellEditor {...props} />);
    wrapperInstance = wrapper.instance() as PureAgGridCellEditor;
    wrapperInstance.afterGuiAttached();
  };

  beforeEach(() => mountComponent(props));

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should isCancelAfterEnd', () => {
    expect(wrapperInstance.isCancelAfterEnd()).to.be.false;
  });

  it('should get value', () => {
    expect(wrapperInstance.getValue()).to.eq(props.value);

    //should render empty value
    mountComponent({ ...props, cellStartedEdit: false, value: '' });
    expect(wrapperInstance.getValue()).to.eq('');
  });

  it('should check setValue', () => {
    wrapperInstance.setValue('TEST');
    expect(wrapperInstance.getValue()).to.eq('TEST');
  });

  it('should check setCustomError', () => {
    wrapperInstance.setCustomError('TEST');
    expect(wrapperInstance.customErrorMessage).to.eq('TEST');
  });

  it('should check hasError', () => {
    expect(wrapperInstance.hasError).to.be.false;
  });

  it('should trigger default change handler', () => {
    const event = { target: { value: 'test1' } };
    const textField = wrapper.find(AgGridTextField);
    textField.simulate('change', event);
    expect(onInputChange.called).to.be.false;

    wrapper.setProps({ ...props, context: { componentParent: { onInputChange } } });
    textField.simulate('change', event);
    expect(onInputChange.calledWith('test1')).to.be.false;
  });

  it('should show error with empty value ', () => {
    wrapper.find(AgGridTextField).simulate('change', { target: { value: '' } });
    expect(wrapperInstance.hasError).to.be.true;
  });

  it('should trigger blur handler', () => {
    const textField = wrapper.find(AgGridTextField);
    textField.simulate('blur');
    expect(onInputBlur.called).to.be.false;

    wrapper.setProps({ ...props, context: { componentParent: { onInputBlur } } });
    textField.simulate('blur');
    expect(onInputBlur.calledOnce).to.be.true;
  });

  it('should check setRules', () => {
    wrapperInstance.setRules(props.rules);
    expect(wrapperInstance.form.$('field').rules).to.eq(props.rules);
  });
});
