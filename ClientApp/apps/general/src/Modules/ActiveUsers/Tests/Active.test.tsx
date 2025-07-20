import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PureActiveUsers } from '../ActiveUsers';
import { GridApiMock } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ActiveUserModel, ActiveUserStoreMock } from '../../Shared';

describe('Active Users', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const activeUser = new ActiveUserModel({
    tierType: 'Live',
  });

  const columnApi = {
    setColumnGroupOpened: sinon.fake(),
  };

  const props = {
    classes: {},
    activeUsersStore: new ActiveUserStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureActiveUsers {...props} />).dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: activeUser });
    instance.columnApi = columnApi;
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });
});
