import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ViewInputControl } from '@wings-shared/form-controls';
import { AirportSettingsStoreMock, AirportStoreMock } from '../../Shared';
import { IcaoUwaCodeEditor } from '../Components';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('IcaoUwaCodeEditorV2 Module', () => {
  let wrapper: ShallowWrapper;
  let dialogContent: ShallowWrapper;
  let dialogActions: ShallowWrapper;

  const props = {
    field: { key: 'icaoCode', value: 'TEST', label: 'ICAO Code*' },
    airportId: 1,
    inputControl: {},
    airportStore: new AirportStoreMock(),
    airportSettingsStore: new AirportSettingsStoreMock(),
    onSaveSuccess: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<IcaoUwaCodeEditor {...props} />);
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);

    // render dialog Actions and dialogContent
    expect(dialogActions.find(EditSaveButtons)).to.have.length(1);
    expect(dialogContent.find(ViewInputControl)).to.have.length(1);
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

    // else case
    const updateCodeSpy = sinon.spy(props.airportStore, 'updateAirportICAOOrUWAOrRegionalCode');
    dialogActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(updateCodeSpy.calledOnce).true;
  });

  it('should call onValueChange', () => {
    const viewInputControl = dialogContent.find(ViewInputControl);
    viewInputControl.props().onValueChange('KHOU', 'icaoCode');
    expect(viewInputControl.prop('field').value).to.eq('KHOU');

    viewInputControl.props().onValueChange(null, 'icaoCode');
    expect(props.airportSettingsStore.ICAOCodes).to.be.empty;
  });
});
