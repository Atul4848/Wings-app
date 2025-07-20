import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import {
  AirportCustomDetailStoreMock,
  AirportModel,
  AirportSettingsStoreMock,
  AirportStoreMock,
  CustomsDetailInfoModel,
  CustomsLeadTimeModel,
  EntityMapStoreMock,
} from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';
import { BasePermitStore } from '@wings/shared';
import { Field } from 'mobx-react-form';
import { CustomDetailsInfo } from '../Components';

describe('CustomDetailsInfo module', () => {
  let wrapper: ReactWrapper;
  let viewInputControlsGroup: any;

  const selectedAirport = new AirportModel({
    customsDetail: new CustomsDetailInfoModel({
      id: 1,
      airportId: 1,
      customsLeadTimes: [new CustomsLeadTimeModel()],
    }),
  });

  const permitStore = new BasePermitStore();

  const props = {
    useUpsert: {
      form: {
        values: sinon.stub().returns({
          canPassPermitLocation: true,
          customsDocumentRequirements: [],
        }),
        reset: sinon.fake(),
      },
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
    airportCustomDetailStore: new AirportCustomDetailStoreMock(),
  };

  beforeEach(() => {
    props.airportStore.selectedAirport = selectedAirport;
    wrapper = mount(<CustomDetailsInfo {...props} />);
    viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(ViewInputControlsGroup)).to.have.length(1);
  });

  it('should return proper field by calling fieldProp', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    const field = viewInputControlsGroup.prop('field')('canPassPermitLocation');
    expect(field.label).to.eq('CANPASS Program Location');
  });

  it('should test onFocus with customsDocumentRequirements field', () => {
    const getPermitDocuments = sinon.spy(permitStore, 'getPermitDocuments');
    wrapper.find(ViewInputControlsGroup).prop('onFocus')('customsDocumentRequirements');
    expect(getPermitDocuments.called).to.be.true;
  });

  it('should test onValueChange with internationalTrashAvailable field', () => {
    wrapper.find(ViewInputControlsGroup).prop('onValueChange')('internationalTrashAvailable');
    expect(props.useUpsert.clearFormFields.calledOnceWith(['trashRemovalVendor', 'trashRemovalRequestTemplate'])).to.be
      .true;
  });
});
