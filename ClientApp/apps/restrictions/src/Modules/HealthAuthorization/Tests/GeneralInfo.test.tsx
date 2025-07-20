import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ViewInputControl } from '@wings-shared/form-controls';
import { GeneralInfo } from '../Components';

describe('GeneralInfo', () => {
  let wrapper: ShallowWrapper;

  const props = {
    getField: sinon.spy(),
    onChange: sinon.spy(),
    onLabelClick: sinon.spy(),
    onFocus: sinon.spy(),
    onEditClick: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = shallow(<GeneralInfo {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call onValueChange', () => {
    wrapper
      .find(ViewInputControl)
      .at(1)
      .simulate('valueChange');
    expect(props.onChange.called).to.be.true;
  });

  it('should call onLabelClick', () => {
    wrapper
      .find(ViewInputControl)
      .at(1)
      .simulate('labelClick');
    expect(props.onLabelClick.called).to.be.true;
  });

  it('should call onFocus', () => {
    wrapper
      .find(ViewInputControl)
      .at(1)
      .simulate('focus');
    expect(props.onFocus.called).to.be.true;
  });

  it('should call onEditClick', () => {
    wrapper
      .find(ViewInputControl)
      .at(1)
      .simulate('editClick');
    expect(props.onEditClick.called).to.be.true;
  });
});
