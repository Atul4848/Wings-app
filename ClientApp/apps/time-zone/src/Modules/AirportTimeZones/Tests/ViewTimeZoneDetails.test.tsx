import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import ViewTimeZoneDetails from '../Shared/Components/ViewTimeZoneDetails/ViewTimeZoneDetails';
import { TimeZoneDetailStoreMock } from '../../Shared/Mocks';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import sinon from 'sinon';

describe('View Time Zone Details', function () {
  let wrapper: ShallowWrapper;
  let dialogContent: ShallowWrapper;
  const timeZoneDetailStore = new TimeZoneDetailStoreMock();

  beforeEach(function () {
    wrapper = shallow(
      <ViewTimeZoneDetails airportId={1} timeZoneDetailStore={timeZoneDetailStore} />
    );
    dialogContent = wrapper.find(Dialog).dive().dive();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('should render Dialog', function () {
    expect(wrapper.find(Dialog)).to.have.length(1);
  });

  it('should render CustomAgGridReact', function () {
    expect(dialogContent.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should render OK button and close modal by click', function () {
    const caller = sinon.spy();
    ModalStore.close = caller;
    const button = dialogContent.find(PrimaryButton);
    expect(button.text()).to.equal('Ok');
    button.simulate('click');
    expect(caller.calledOnce).to.be.true;
  });

  it('Dialog onClose prop should close modal', function () {
    const caller = sinon.spy();
    ModalStore.close = caller;
    dialogContent.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });
});
