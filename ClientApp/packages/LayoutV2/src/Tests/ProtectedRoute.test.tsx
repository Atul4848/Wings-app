import React from 'react';
import { mount } from 'enzyme';
import { Navigate } from 'react-router-dom';
import sinon from 'sinon';
import {expect} from 'chai'
import { ProtectedRoute } from '../Components'; // Import your ProtectedRoute component

describe('ProtectedRoute', () => {
  let wrapper;
  let protectedRouteWithPermission;

  beforeEach(() => {
    wrapper = sinon.createSandbox();

    protectedRouteWithPermission = (
      <ProtectedRoute
        hasPermission={true}
        element={<div id="protected-content">Protected Content</div>}
        redirectPath="/login"
      />
    );
  });

  afterEach(() => {
    wrapper.restore();
  });

  it('renders the element when hasPermission is true', () => {
    const wrapper = mount(protectedRouteWithPermission);

    expect(wrapper.find('#protected-content')).to.have.length(1);
    expect(wrapper.find(Navigate)).to.have.length(0);
  });

});
