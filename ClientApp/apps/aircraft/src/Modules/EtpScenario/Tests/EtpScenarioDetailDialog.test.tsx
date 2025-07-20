import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { EtpScenarioStoreMock, EtpSettingsStoreMock, SettingsStoreMock } from '../../Shared';
import { EtpScenarioDetailDialog, EtpScenarioEditor } from '../Components';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { VIEW_MODE } from '@wings/shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { UIStore } from '@wings-shared/core';

describe('ETP Scenario Details Dialog', () => {
  let wrapper: any;
  let wrapperInstance: any;
  let dialogContent: ShallowWrapper;
  let dialogActions: ShallowWrapper;

  const props = {
    classes: {},
    viewMode: VIEW_MODE.EDIT,
    etpScenarioId: 1,
    etpScenarioStore: new EtpScenarioStoreMock(),
    etpSettingsStore: new EtpSettingsStoreMock(),
    settingsStore: new SettingsStoreMock(),
    onModelUpdate: sinon.fake(),
  };

  const renderView = props => {
    wrapper = shallow(<EtpScenarioDetailDialog {...props} />);
    wrapperInstance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
  };

  beforeEach(() => renderView(props));

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('dialog content should render AirportHoursEditor', () => {
    expect(dialogContent.find(EtpScenarioEditor)).to.be.ok;
  });

  it('should render dialog isLoading', () => {
    UIStore.setPageLoader(true);
    expect(wrapper.find(Dialog).prop('isLoading')()).to.be.true;
  });

  it('should call closeHandler when dialog closed', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('save button should call onModelUpdate on props', () => {
    dialogActions.find(PrimaryButton).at(1).simulate('click');
    expect(props.onModelUpdate.called).to.true;
  });

  it('cancel button should change view mode to details', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    dialogActions.find(PrimaryButton).at(1).simulate('click');
    expect(closeSpy.called).to.be.true;
  });

});
