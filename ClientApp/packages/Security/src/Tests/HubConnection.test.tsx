import React from 'react';
import { mount } from 'enzyme';
import {HubConnection} from '../Components'; // Adjust the import path based on your project structure
import { HubConnectionStore } from '../Stores';
import { assert } from 'chai';
import sinon from 'sinon';

describe('HubConnection Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<HubConnection />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render without errors', () => {
    assert.isTrue(wrapper.exists());
  });

  it('should call HubConnectionStore.enable on componentDidMount', async () => {
    const enableSpy = sinon.spy(HubConnectionStore, 'enable');
    wrapper = mount(<HubConnection />);
    await Promise.resolve();
    assert.isTrue(enableSpy.calledOnce);
    enableSpy.restore();
  });

});
