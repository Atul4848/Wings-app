import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { SettingOptionsModel } from '../../Shared';
import { Dialog } from '@uvgo-shared/dialog';
import { Button } from '@material-ui/core';
import { PureOptionField } from '../Components/OptionField/OptionField';

describe('Option Field', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: any;

  const props = {
    classes: {},
    title: '',
    optionField: new SettingOptionsModel({
      type: {
        label: 'test',
        value: 'test'
      }
    }),
    viewMode: VIEW_MODE.NEW,
    optionsField: [new SettingOptionsModel({ keyName: 'test' })],
    upsertOptionField: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureOptionField {...props} />);
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render ViewInputControls', () => {
    expect(dialogContent.find(ViewInputControl)).to.have.length(3);
  });

  it('should call upsertOptionField method on click of save button', () => {
    dialogContent.find(Button).simulate('click');
    expect(props.upsertOptionField.called).to.be.true;
  });

  it('should check if keyName already exists or not', () => {
    instance.getField('keyName').set('test');
    expect(instance.isExists).to.be.true;
  });
});
