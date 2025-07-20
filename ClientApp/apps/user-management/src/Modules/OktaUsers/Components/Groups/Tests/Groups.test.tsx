import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import Groups from '../Groups';
import { UserGroupModel } from '../../../../Shared';
import { Button } from '@material-ui/core';

describe('Groups Module', () => {
  const props = {
    classes: {},
    groups: [new UserGroupModel(), new UserGroupModel()],
    onAction: sinon.fake((id: string) => ''),
  };
  let wrapper: ShallowWrapper;
  let instance: any;

  beforeEach(() => {
    wrapper = shallow(<Groups {...props} />).dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onAction method', () => {
    wrapper.setProps({ ...props, isUserGroups: true });
    wrapper.find(Button).at(0).simulate('click');
    expect(props.onAction.calledOnce).to.be.true;
  });
});
