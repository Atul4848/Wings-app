import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { UserGroups } from '../../index';
import { UserGroupModel } from '../../../../index';
import { MemoryRouter } from 'react-router';

describe('Group Details Module', function () {
  const props = {
    classes: {},
    userGroups: [ new UserGroupModel({ name: 'Everyone' }) ],
  };

  let wrapper: ReactWrapper;

  beforeEach(function () {
    wrapper = mount(
      <MemoryRouter>
        <UserGroups {...props} />
      </MemoryRouter>
    );
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.be.ok;
  });
});
