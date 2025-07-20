import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import { AirportCustomDetailStoreMock, AirportCustomModel, AirportModel, AirportStoreMock, IntlCustomsDetailsModel } from '../../Shared';
import { IntlCustomsDetails } from '../Components';
describe('Airport Customs International/Nos Us Details', () => {
  let wrapper: any;
  let viewInputControlsGroup: any;

  const selectedAirport = new AirportModel({
    customs: new AirportCustomModel({
      internationalCustomsInformation: new IntlCustomsDetailsModel({ airportId: 1 }),
    }),
  });

  const props = {
    useUpsert: {
      form: { values: 'Test', reset: sinon.fake() },
      getField: (fieldKey: string) => ({
        set: sinon.spy(),
        clear: sinon.fake(),
      }),
      setFormValues: sinon.fake(),
      observeSearch: sinon.spy(),
      onValueChange: sinon.spy(),
      setFormFields: sinon.fake(),
    },
    airportStore: new AirportStoreMock(),
    airportCustomDetailStore: new AirportCustomDetailStoreMock()
  };

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = mount(<IntlCustomsDetails {...props} />);
    viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call onValueChange method with different fieldKeys', () => {
    const fieldsToTest = [
      'overtimeAllowed',
      'taxRefundAvailable',
      'quarantineInfo.agricultureAvailable',
      'quarantineInfo.immigrationAvailable',
      'quarantineInfo.internationalTrashAvailable',
    ];
    fieldsToTest.forEach(fieldKey => viewInputControlsGroup.props().onValueChange(false, fieldKey));
    fieldsToTest.forEach(fieldKey => expect(props.useUpsert.onValueChange.calledWith(false, fieldKey)).to.be.true);
  });
});
