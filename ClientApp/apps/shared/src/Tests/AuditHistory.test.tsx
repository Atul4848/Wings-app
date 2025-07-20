import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { AuditHistory } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { baseApiPath } from '../API';

describe('Audit History', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;
  let dialogActions: ShallowWrapper;

  const props = {
    classes: {},
    title: 'Test',
  };

  beforeEach(() => {
    wrapper = shallow(<AuditHistory {...props} entityId={1} entityType="City" baseUrl={baseApiPath.countries} />, {
      disableLifecycleMethods: true,
    }).dive();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
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
