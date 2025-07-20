import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { HealthVendorContactGrid, HealthVendorContact } from '../Components';
import { HealthVendorContactModel } from '../../Shared';
import { SettingsTypeModel } from '@wings-shared/core';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('HealthVendorContact', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const contacts = [
    new HealthVendorContactModel({
      contactType: new SettingsTypeModel({ id: 1 }),
    }),
  ];

  const props = {
    contacts,
    onUpdate: sinon.fake(),
    onContactEditing: sinon.fake(),
    getField: sinon.fake.returns({ value: true }),
    onChange: sinon.spy(),
    isEditable: true,
  };

  beforeEach(() => {
    wrapper = shallow(<HealthVendorContact {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should update the survey link', () => {
    wrapper
      .find(ViewInputControl)
      .props()
      .onValueChange('1', 'surveyLink');
  });

  it('should update contacts', () => {
    const updatedData = [new HealthVendorContactModel()];

    // For Phone
    wrapper
      .find(HealthVendorContactGrid)
      .at(0)
      .simulate('update', updatedData);
    expect(props.onUpdate.calledWith(updatedData)).to.be.true;

    // For Email
    wrapper
      .find(HealthVendorContactGrid)
      .at(1)
      .simulate('update', updatedData);
    expect(props.onUpdate.calledWith(updatedData)).to.be.true;
  });

  it('should call onContactEditing on row edit', () => {
    const updatedData = [new HealthVendorContactModel()];

    // For Phone
    wrapper
      .find(HealthVendorContactGrid)
      .at(0)
      .simulate('contactEditing', updatedData);
    expect(props.onUpdate.calledWith(updatedData)).to.be.true;

    // For Email
    wrapper
      .find(HealthVendorContactGrid)
      .at(1)
      .simulate('contactEditing', updatedData);
    expect(props.onUpdate.calledWith(updatedData)).to.be.true;
  });
});
