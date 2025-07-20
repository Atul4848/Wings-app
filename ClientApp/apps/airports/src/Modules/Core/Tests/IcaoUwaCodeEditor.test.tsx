import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import { AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { PureIcaoUwaCodeEditor } from '../Components/AirportGeneralInformation/IcaoUwaCodeEditor/IcaoUwaCodeEditor';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('IcaoUwaCodeEditor Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;
  let dialogActions: ShallowWrapper;
  const airportStore = new AirportStoreMock();
  const airportSettingsStore = new AirportSettingsStoreMock();

  const props = {
    classes: {},
    field: { key: 'icaoCode', value: 'TEST', label: 'ICAO Code*' },
    airportId: 1,
    viewMode: VIEW_MODE.EDIT,
    airportStore,
    airportSettingsStore,
    inputControl: {},
    onSaveSuccess: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureIcaoUwaCodeEditor {...props} />);
    instance = wrapper.instance();
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);

    // render dialog Actions
    expect(dialogActions.find(EditSaveButtons)).to.have.length(1);
  });

  it('should call ModalStore.close() when dialog closed', () => {
    const caller = sinon.fake();
    ModalStore.close = caller;
    wrapper.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });

  it('should call onAction', () => {
    const caller = sinon.fake();
    ModalStore.close = caller;
    dialogActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(caller.called).to.be.true;
  });

  it('should call onValueChange', () => {
    const onValueChangeSpy = sinon.spy(instance, 'onValueChange');
    dialogContent.find(ViewInputControl).simulate('valueChange', 'TEST', 'icaoCode');
    expect(onValueChangeSpy.calledWith('TEST', 'icaoCode')).true;

    // when there is no value
    dialogContent.find(ViewInputControl).simulate('valueChange', null, 'icaoCode');
    expect(instance.airportSettingsStore.ICAOCodes).to.be.empty;
  });

  it('airport Codes should be validated onValueChange of icaoCode', () => {
    const validateAirportCodesSpy = sinon.spy(instance, 'validateAirportCodes');
    instance.onValueChange('ICAOCODE', 'icaoCode');
    expect(validateAirportCodesSpy.called).true;
  });

  it('onSearch should search for icao code if fieldKey is icaoCode', () => {
    const onSearchSpy = sinon.spy(instance, 'onSearch');
    dialogContent.find(ViewInputControl).simulate('search', 'TEST', 'icaoCode');
    expect(onSearchSpy.calledWith('TEST', 'icaoCode')).true;
  });

  it('onSearch should search for uwa code if fieldKey is uwaAirportCode', () => {
    instance.onSearch(null, 'uwaAirportCode');
    expect(instance.airportSettingsStore.uwaCodes).to.be.empty;

    // else case
    const searchUwaCodeSpy = sinon.spy(instance.airportSettingsStore, 'loadUwaCodes');
    instance.onSearch('TEST', 'uwaAirportCode');
    expect(searchUwaCodeSpy.called).true;
  });

  it('onSearch should search for regional code if fieldKey is regionalAirportCode', () => {
    instance.onSearch(null, 'regionalAirportCode');
    expect(instance.airportSettingsStore.regionalCodes).to.be.empty;

    // else case
    const searchRegionalCodeSpy = sinon.spy(instance.airportSettingsStore, 'loadRegionalCodes');
    instance.onSearch('TEST', 'regionalAirportCode');
    expect(searchRegionalCodeSpy.called).true;
  });
});
