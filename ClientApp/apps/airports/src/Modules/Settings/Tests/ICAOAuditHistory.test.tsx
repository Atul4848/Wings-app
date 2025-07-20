import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ICAOAuditHistory } from '../Components';
import { AirportSettingsStoreMock } from '../../Shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('ICAO Audit History Module', () => {
  let wrapper: ShallowWrapper;
  let dialogContent: ShallowWrapper;
  const airportSettingsStore = new AirportSettingsStoreMock();

  const props = {
    classes: {},
    icaoCode: 'Test',
    airportSettingsStore,
  };

  beforeEach(() => {
    wrapper = shallow(<ICAOAuditHistory {...props} />).dive();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('should call dialogContent', () => {
    expect(dialogContent.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should set isloading false', () => {
    expect(wrapper.find(Dialog).prop('isLoading')()).to.be.false;
  });
});
