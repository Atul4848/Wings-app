import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ViewAirportDetails } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Time Zone Review Info Module', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<ViewAirportDetails stagingTimeZoneId={0} isStagingTimezones={true} />, {
      disableLifecycleMethods: true,
    }).dive();
  });

  it('should be rendered without errors and should render Dialog', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find('Dialog')).to.have.length(1);
  });

  it('should call close modal on dialog close', () => {
    const closeSpy = sinon.spy();
    ModalStore.close = closeSpy;
    wrapper.find('Dialog').simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('should close modal on click Cancel in dialogAction', () => {
    const closeSpy = sinon.spy();
    ModalStore.close = closeSpy;
    const dialogActions = wrapper.find('Dialog').prop('dialogActions')();
    shallow(<div>{dialogActions}</div>)
      .find(PrimaryButton)
      .simulate('click');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('Dialog should have CustomAgGridReact', () => {
    const dialogContent = wrapper.find('Dialog').prop('dialogContent')();
    const customAgGrid = shallow(<div>{dialogContent}</div>).find(CustomAgGridReact);
    expect(customAgGrid).to.have.length(1);
  });
});
