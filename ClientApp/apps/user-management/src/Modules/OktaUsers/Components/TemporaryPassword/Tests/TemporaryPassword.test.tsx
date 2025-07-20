import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import TemporaryPassword from '../TemporaryPassword';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import sinon from 'sinon';

describe('Temporary Password Module', () => {
  let wrapper: ShallowWrapper;
  const props = {
    classes: {},
    title: "Temporary Password",
    temporaryPassword: "cxCxw3T2"
  };

  beforeEach(() => {
    wrapper = shallow(<TemporaryPassword {...props} />).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call ModalStore.close() when dialog closed', () => {
    const caller = sinon.fake();
    ModalStore.close = caller;
    wrapper.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });
});
