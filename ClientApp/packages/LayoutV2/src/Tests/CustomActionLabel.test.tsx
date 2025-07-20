import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import CustomActionLabel from '../Components/CustomActionLabel/CustomActionLabel';
import sinon from 'sinon';

describe('CustomActionLabel Component', () => {
  let wrapper: any;
  const mockProps = {
    label: 'Edit',
    tooltip: 'Edit Tooltip',
    onAction: sinon.spy(),
  };
  beforeEach(() => {
    wrapper = shallow(
      <CustomActionLabel
        label="Test Label"
        tooltip="Test Tooltip"
        {...mockProps}
      />
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });
  it('renders without crashing', () => {
    expect(wrapper.exists()).to.be.true;
  });

  it('displays the label', () => {
    const wrapper = shallow(
      <CustomActionLabel
        label="Test Label"
        tooltip="Test Tooltip"
        {...mockProps}
      />
    ).dive();
    expect(wrapper.find('span').text()).to.equal(mockProps.label);
  });
});
