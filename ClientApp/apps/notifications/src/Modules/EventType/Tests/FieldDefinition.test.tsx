import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import PureFieldDefinition from '../Components/FieldDefinition/FieldDefinition';
import { FieldDefinitionModel } from '../../Shared';
import { Dialog } from '@uvgo-shared/dialog';
import { Button } from '@material-ui/core';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Field Definition', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: any;

  const props = {
    classes: {},
    title: '',
    fieldDefinition: new FieldDefinitionModel(),
    viewMode: VIEW_MODE.NEW,
    fieldDefinitions: [new FieldDefinitionModel({ variableName: 'test' })],
    upsertField: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureFieldDefinition {...props} />).dive();
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
    expect(dialogContent.find(ViewInputControl)).to.have.length(5);
  });

  it('should call upsertField method on click of save button', () => {
    dialogContent.find(Button).simulate('click');
    expect(props.upsertField.called).to.be.true;
  });

  it('should check if variableName already exists or not', () => {
    instance.getField('variableName').set('test');
    expect(instance.isExists).to.be.true;
  });
});
