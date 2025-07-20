import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import {
  AirportCustomDetailStoreMock,
  AirportCustomGeneralModel,
  AirportCustomModel,
  AirportModel,
  AirportSettingsStoreMock,
  AirportStoreMock,
  EntityMapStoreMock,
} from '../../Shared';
import { Field } from 'mobx-react-form';
import { GeneralInfo } from '../Components';
describe('Airport Customs GeneralInfo', () => {
  let wrapper: any;
  let viewInputControlsGroup: any;

  const selectedAirport = new AirportModel({
    customs: new AirportCustomModel({ generalInformation: new AirportCustomGeneralModel({ airportId: 1 }) }),
  });

  const props = {
    useUpsert: {
      form: { values: 'Test', reset: sinon.fake() },
      getField: (fieldKey: string) => Field,
      setFormFields: sinon.spy(),
      setFormValues: sinon.fake(),
      observeSearch: sinon.spy(),
      onValueChange: sinon.spy(),
      clearFormFields: sinon.spy(),
    },
    airportSettingsStore: new AirportSettingsStoreMock(),
    airportStore: new AirportStoreMock(),
    entityMapStore: new EntityMapStoreMock(),
    airportCustomDetailStore: new AirportCustomDetailStoreMock()
  };

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = mount(<GeneralInfo {...props} />);
    viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call onFocus method', () => {
    const loadEntitiesSpy = sinon.spy(props.entityMapStore, 'loadEntities');
    viewInputControlsGroup.prop('onFocus')('appliedMaxPOBAltClearanceOptions');
    expect(loadEntitiesSpy.called).to.be.true;
  });

  it('should call onValueChange method with customOfficerDispacthedFromAirport', () => {
    viewInputControlsGroup.props().onValueChange(null, 'customOfficerDispacthedFromAirport');
    expect(props.entityMapStore.airports.length).to.eq(0);
  });

  it('should call onValueChange method with customsClearanceFBOs', () => {
    viewInputControlsGroup.props().onValueChange([], 'customsClearanceFBOs');
    expect(props.entityMapStore.vendorLocations.length).to.eq(0);
  });

  it('should call onSearch method', () => {
    const searchEntitiesSpy = sinon.spy(props.entityMapStore, 'searchEntities');
    viewInputControlsGroup.props().onSearch('abc', 'customsClearanceFBOs');
    expect(searchEntitiesSpy.calledOnce).to.be.true;
  });
});
