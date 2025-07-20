import React from 'react';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { TemplateStoreMock } from '../../Shared';
import PureSendTemplatePreview from '../Components/SendTemplatePreview/SendTemplatePreview';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { TextField } from '@material-ui/core';

describe('Send Template Preview', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;
  const templateStore = new TemplateStoreMock();

  const props = {
    templateStore,
    templateContent: '',
    templateSubject: '',
    templateDeliveryType: '',
    classes: {},
  };

  beforeEach(() => {
    wrapper = shallow(<PureSendTemplatePreview {...props} />).dive().dive();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('close button should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('onChange should be called on TextField change', () => {
    const mockValueChange = sinon.fake();
    instance.onChange = mockValueChange;
    dialogContent.find(TextField).simulate('change');
    expect(mockValueChange.called).to.be.true;
  });
});
