import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { HealthVendorContact, HealthVendorTabs } from '../Components';

describe('HealthVendorTabs', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    contacts: [],
    onUpdate: sinon.fake(),
    onContactEditing: sinon.fake(),
    getField: sinon.fake.returns({ value: true }),
    onChange: sinon.spy(),
    isEditable: true,
  };

  beforeEach(() => {
    wrapper = shallow(<HealthVendorTabs {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should work with contact Info', () => {
    const healthVendorContact = wrapper.find(HealthVendorContact);

    // should render healthVendorContact
    expect(healthVendorContact).to.be.ok;

    // should call onUpdate on data update
    healthVendorContact.simulate('update');
    expect(props.onUpdate.called).to.be.true;

    // should call isContactEditing on row edit
    healthVendorContact.simulate('contactEditing');
    expect(props.onContactEditing.called).to.be.true;
  });
});
