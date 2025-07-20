import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import ThemeContainer from '../Components/ThemeContainer/ThemeContainer';
import { EventEmitter } from '@wings-shared/core';

describe('ThemeContainer', () => {
  let changeThemeStub;
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<ThemeContainer children={undefined} />);
    changeThemeStub = sinon.stub(EventEmitter, 'on');
  });

  afterEach(() => {
    wrapper.unmount();
    changeThemeStub.restore();
  });

  it('should handle theme change', () => {
    const event = new CustomEvent('change', { detail: 'LIGHT' });
    window.dispatchEvent(event);
  });
});
