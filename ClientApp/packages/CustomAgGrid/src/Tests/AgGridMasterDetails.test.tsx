import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridMasterDetails } from '../Components';
import sinon from 'sinon';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';

describe('AgGridMasterDetails component', () => {
  let wrapper: ShallowWrapper;
  const props = {
    addButtonTitle: 'add',
    hasAddPermission: true,
    disabled: false,
    children: <div>Test</div>,
    onAddButtonClick: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridMasterDetails {...props} />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onAddButtonClick', () => {
    wrapper.find(PrimaryButton).simulate('click');
    expect(props.onAddButtonClick.calledOnce).to.be.true;
  });
});
