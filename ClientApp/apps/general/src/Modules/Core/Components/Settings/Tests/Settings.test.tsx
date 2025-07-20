import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CacheControlStoreMock } from '../../../../Shared/Mocks';
import { PureSettings } from '../Settings';
import { AgGridSwitch, CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('Cache Settings Component', function () {
  let wrapper: ShallowWrapper;
  const props = {
    classes: {},
    cacheControlStore:new CacheControlStoreMock()
  };

  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);
  const agGridSwitch = (): ShallowWrapper => wrapper.find(AgGridSwitch);
  beforeEach(function () {
    wrapper = shallow(<PureSettings {...props} />).dive();
  });

  it('should be rendered without errors, and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(customAgGridReact()).to.be.ok;
  });

  it('agGridSwitch should be rendered without errors', () => {
    expect(agGridSwitch()).to.be.ok;
  })
});
