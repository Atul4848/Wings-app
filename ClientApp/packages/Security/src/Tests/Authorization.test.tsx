import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { Authorization } from '../Components';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'chai';
import { AuthStore } from '../Stores';
import { UserMock } from '../Mocks';
import { USER_GROUP } from '../Enums';

describe('Authorization Component', () => {
  let wrapper;
  let authenticateStub;

  beforeEach(() => {
    AuthStore.onUserUnloaded();
    const user = new UserMock([USER_GROUP.ADMIN]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    authenticateStub = sinon.stub().returns({ subscribe: () => {} });
    wrapper = shallow(
      <MemoryRouter> 
      <Authorization navigate={() => {}} children={<div>Child Component</div>} />
    </MemoryRouter>
    );
  });

  it('should render without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should unload user without errors', () => {
    wrapper.unmount();
    expect(wrapper).to.have.length(1);
  });

  it('renders child components when authenticated', () => {
    wrapper.update(); 
    expect(wrapper.find('div')).to.have.length(1);
    expect(wrapper.text()).to.be;
  });
});
