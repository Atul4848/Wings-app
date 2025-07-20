import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { TemplateStoreMock } from '../../Shared';
import { PureTemplatePreview } from '../Components/TemplatePreview/TemplatePreview';
import { Button } from '@material-ui/core';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';

describe('Template Preview', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const templateStore = new TemplateStoreMock();

  const props = {
    classes: {},
    templateStore,
    params: { id: 1 },
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureTemplatePreview {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should generate test data from template content', () => {
    const onTestDataChangeSpy = sinon.spy(instance, 'onTestDataChange');
    wrapper.find(Button).at(0).simulate('click');
    expect(onTestDataChangeSpy.called).to.be.true;
  });
});
