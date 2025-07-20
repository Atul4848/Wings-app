import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { RolesModel } from '../../Shared';
import { Dialog } from '@uvgo-shared/dialog';
import { Button } from '@material-ui/core';
import { PureRoleField } from '../Components/RoleField/RoleField';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Role Field', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: any;

  const props = {
    classes: {},
    title: '',
    roleField: new RolesModel(),
    viewMode: VIEW_MODE.NEW,
    rolesField: [new RolesModel({ name: 'test' })],
    upsertRoleField: sinon.fake(), 
  };

  beforeEach(() => {
    wrapper = shallow(<PureRoleField {...props} />);
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
    expect(dialogContent.find(ViewInputControl)).to.have.length(2);
  });

  it('should call upsertRoleField method on click of save button', () => {
    dialogContent.find(Button).simulate('click');
    expect(props.upsertRoleField.called).to.be.true;
  });
  
});
