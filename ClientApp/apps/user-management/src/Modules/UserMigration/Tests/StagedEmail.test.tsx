import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { StagedEmail } from '../Components';
import { CSDUserModel } from '../../Shared';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';

describe('Staged Email Component', () => {
  const props = {
    classes: {},
    selectedCsdUser: new CSDUserModel({ id: 5701, name: 'uvgaqtp1', firstName: 'test', lastName: 'test' }),
    updateStagedEmail: sinon.spy(),
  };

  let wrapper: ShallowWrapper;
  let instance: any;

  beforeEach(() => {
    wrapper = shallow(<StagedEmail {...props} />).shallow();
    instance = wrapper.instance() as any;
  });

  it('Should render without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call closeHandler when dialog closed', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });
});
