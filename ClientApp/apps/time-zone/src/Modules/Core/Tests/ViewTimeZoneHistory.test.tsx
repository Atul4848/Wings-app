import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import ViewTimeZoneHistory from '../Components/ViewTimeZoneHistory/ViewTimeZoneHistory';
import { TimeZoneStoreMock } from '../../Shared/Mocks/TimeZoneStore.mock';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import Sinon from 'sinon';

describe('View Time Zone History', function () {
  let wrapper: any;
  let dialog: ShallowWrapper;
  const store = new TimeZoneStoreMock();

  beforeEach(function () {
    wrapper = shallow(<ViewTimeZoneHistory timezoneStore={store} timezoneId={0} />);
    dialog = wrapper.find(Dialog).dive().dive();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('should render Dialog', function () {
    expect(wrapper.find(Dialog)).to.have.length(1);
  });

  it('should render CustomAgGridReact', function () {
    expect(dialog.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should render Close button as Dialog Action by click should fire ModalStore.close()', function () {
    const caller = Sinon.spy();
    ModalStore.close = caller;
    dialog.find(PrimaryButton).simulate('click');
    expect(caller.calledOnce).to.be.true;
  });

  it(' should close modal on onClose', function () {
    const closeSpy = Sinon.spy();
    ModalStore.close = closeSpy;
    dialog.simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });
});
