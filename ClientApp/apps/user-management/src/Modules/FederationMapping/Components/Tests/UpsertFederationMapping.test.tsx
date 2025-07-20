import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { VIEW_MODE } from '@wings/shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import UpsertFederationMapping from '../UpsertFederationMapping';
import { FederationMappingStoreMock } from '../../../Shared';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Upsert Federation Mapping Dialog', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  const props = {
    classes: {},
    federationMappingStore: new FederationMappingStoreMock(),
    upsertIdpMapping: sinon.fake(),
    viewMode: VIEW_MODE.EDIT,
    clientId: 1,
  };

  const renderView = props => {
    wrapper = shallow(<UpsertFederationMapping {...props} />).dive().shallow();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  };

  beforeEach(() => renderView(props));

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('save button should call UpsertIdpMapping on props', () => {
    dialogContent.find(PrimaryButton).simulate('click');
    expect(props.upsertIdpMapping.calledOnce).to.true;
  });

  it('close button should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('onValueChange should be called on ViewInputControl change', () => {
    const mockValueChange = sinon.fake();
    instance.onValueChange = mockValueChange;
    dialogContent.find(ViewInputControl).at(0).simulate('ValueChange');
    expect(mockValueChange.called).to.be.true;
  })

  it('onValueChange should update form value', () => {
    const mockFormUpdate = sinon.fake();
    instance.getField('customerNumber').set = mockFormUpdate;
    instance.onValueChange('test', 'customerNumber');
    expect(mockFormUpdate.called).to.be.true;
  });
});
