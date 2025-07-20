import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AirportHeaderSection } from '../Components';
import { AirportModel, VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import MobxReactForm, { Field } from 'mobx-react-form';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { getFormValidation, StatusTypeModel } from '@wings-shared/core';

describe('Airport Header Section Component', () => {
  let wrapper: ShallowWrapper;

  const form: MobxReactForm = getFormValidation({
    airport: { label: 'AIRPORT' },
    airportHoursType: { label: 'AIRPORT_HOURS_TYPE' },
    associateAirport: { label: 'ASSOCIATE_AIRPORT' },
  });

  const props = {
    classes: {},
    viewMode: VIEW_MODE.DETAILS,
    isLoading: false,
    isDisabled: false,
    isEditing: true,
    airportHourTypes: [],
    wingsAirports: [],
    onAddNewAirport: sinon.fake(),
    onValueChange: sinon.fake(),
    getField: (fieldKey: string) => form.$(fieldKey),
    onViewModeChange: sinon.fake(),
    onSearchAirport: sinon.fake(),
    onAssociateAirport: sinon.fake(),
  };

  const airport = new AirportModel({
    id: 1,
    name: 'Test',
    displayCode: 'ABCD',
    status: new StatusTypeModel({ id: 2, name: 'Inactive' }),
  });

  beforeEach(() => {
    wrapper = shallow(<AirportHeaderSection {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call value change with ViewInputControl', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(0);
    viewInputControl.simulate('valueChange', 'Test', 'Test');
    expect(props.onValueChange.calledWith('Test', 'Test')).to.be.true;

    // call search
    viewInputControl.simulate('search', 'Test');
    expect(props.onSearchAirport.calledWith('Test')).to.be.true;
  });

  it('should call value change with ViewInputControl', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(1);
    viewInputControl.simulate('valueChange', 'Test', 'Test');
    expect(props.onValueChange.calledWith('Test', 'Test')).to.be.true;
  });

  it('should call value change and search for airport association ViewInputControl', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(2);
    viewInputControl.simulate('valueChange', 'Test', 'Test');
    expect(props.onValueChange.calledWith('Test', 'Test')).to.be.true;

    // call search
    viewInputControl.simulate('search', 'Test');
    expect(props.onSearchAirport.calledWith('Test')).to.be.true;
  });

  it('should update view mode to DETAILS with PrimaryButton', () => {
    wrapper
      .find(PrimaryButton)
      .at(0)
      .simulate('click');
    expect(props.onViewModeChange.calledWith(VIEW_MODE.DETAILS)).to.be.true;
  });

  it('should update view mode to EDIT with PrimaryButton', () => {
    wrapper.setProps({ ...props, isEditing: false });
    wrapper
      .find(PrimaryButton)
      .at(0)
      .simulate('click');
    expect(props.onViewModeChange.calledWith(VIEW_MODE.EDIT)).to.be.true;
  });

  it('should call onAssociateAirport with PrimaryButton', () => {
    wrapper
      .find(PrimaryButton)
      .at(1)
      .simulate('click');
    expect(props.onAssociateAirport.called).to.be.true;
  });

  it('should call onAddNewAirport with PrimaryButton', () => {
    wrapper
      .find(PrimaryButton)
      .at(2)
      .simulate('click');
    expect(props.onAddNewAirport.called).to.be.true;
  });

  it('should render Inactive button', () => {
    props.getField('airport').set(airport);
    expect(wrapper.find(SecondaryButton)).to.have.length(1);
  });
});
