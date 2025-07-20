/* eslint-disable mocha/no-setup-in-describe */
import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import { AirportMappingsModel, AirportMappingsStoreMock } from '../../Shared';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import  UpsertAirportMapping  from '../Components/UpsertAirportMappingV2';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Upsert Airport upsert Mapping test Module V2', function() {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;
  const airportMappingsModel = new AirportMappingsModel();
  const airportMappingsStore = new AirportMappingsStoreMock();

  const props = {
    classes: {},
    viewMode: VIEW_MODE.EDIT,
    airportMappingsStore,
    airportMappingsModel ,
    inputControl: {},
    upsertMapping: sinon.fake(),
  };

  beforeEach(function() {
    wrapper = shallow(<UpsertAirportMapping {...props} />);
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should call ModalStore.close() when dialog closed', function() {
    const caller = sinon.fake();
    ModalStore.close = caller;
    wrapper.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });

  it('save button should call UpsertMapping on props', function() {
    dialogContent.find(PrimaryButton).simulate('click');
    expect(props.upsertMapping.calledOnce).to.true;
  });

});
