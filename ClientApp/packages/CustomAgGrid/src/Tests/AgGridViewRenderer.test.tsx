import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { createTheme } from '@material-ui/core/styles';
import { LightTheme } from '@uvgo-shared/themes';
import { expect } from 'chai';
import { AgGridViewRenderer } from '../Components';

describe('AgGridViewRenderer React', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance;
  const theme = createTheme(LightTheme);

  const props = {
    context: { theme },
    rowIndex: 0,
    getValue: () => true,
    getViewRenderer: () => <div>TEST</div>,
  };

  beforeEach(() => {
    wrapper = shallow(<AgGridViewRenderer {...props} />).dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render call refresh', () => {
    expect(wrapperInstance.refresh()).to.eq(true);
  });

  it('should return a object with getGui method', () => {
    wrapperInstance.viewRendererRef = { current: 'TEST' };
    expect(wrapperInstance.getGui()).to.eq('TEST');
  });

  it('should render viewRenderer', () => {
    expect(wrapper.find('div').text()).to.eq('TEST');
  });
});
