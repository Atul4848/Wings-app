import React from 'react';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { RootTemplateStoreMock } from '../../Shared';
import { PureRootEmailTemplate } from '../Components/RootEmailTemplate/RootEmailTemplate';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { TextField } from '@material-ui/core';
import { VIEW_MODE } from '@wings/shared';

describe('Root Email Template', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;
  const templateStore = new RootTemplateStoreMock();

  const props = {
    templateStore,
    classes: {},
    viewMode: VIEW_MODE.EDIT,
    params: { mode: VIEW_MODE.EDIT },
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureRootEmailTemplate {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('onChange should be called on TextField change', () => {
    const mockValueChange = sinon.fake();
    instance.onChange = mockValueChange;
    wrapper.find(TextField).simulate('change');
    expect(mockValueChange.called).to.be.true;
  });
});
