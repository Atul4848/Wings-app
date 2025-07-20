/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable mocha/no-hooks-for-single-case */
/* eslint-disable mocha/no-setup-in-describe */
import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import UpsertSetting from '../Components/UpsertSetting/UpsertSetting';
import { SETTING_TYPE, SyncSettingsModel, SyncSettingsStoreMock } from '../../Shared';
import { expect } from 'chai';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Button } from '@material-ui/core';

describe('Upsert Sync Settings', function () {
  let wrapper: ShallowWrapper;
  let instance;
  let dialogContent: ShallowWrapper;
 
  let dialogElement: JSX.Element;
  const props = {
    syncSettings: new SyncSettingsModel(),
    onUpdate: sinon.fake(),
    syncSettingsStore: new SyncSettingsStoreMock(),
    settingType: SETTING_TYPE.SETTING,
  };

  const renderView = props => { 
    wrapper = shallow(<UpsertSetting {...props} />).dive().dive();
    instance = wrapper.instance(); 
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  };

 

  beforeEach(function() { return renderView(props); });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.be.ok;
  });

  it('close button should close dialog', function () {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('save button should call OnUpdate on props', function() {
    dialogContent.find(Button).simulate('click');
    expect(props.onUpdate.calledOnce).to.true;
  });


});



