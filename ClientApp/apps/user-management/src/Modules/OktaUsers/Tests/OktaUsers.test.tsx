import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { PureCoreModule } from '../OktaUsers';
import { GridApiMock, IGridApi } from '@wings/shared';
import { GroupStoreMock, SessionStoreMock, UserStoreMock } from '../../Shared/Mocks';
import { UserResponseModel } from '../../Shared';
import { USER_FILTER } from '../../Shared/Enums';
import { SearchHeader } from '@wings-shared/form-controls';

describe('User Management Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;
  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeader);
  const props = {
    sessionStore: new SessionStoreMock(),
    classes: {},
  };

  beforeEach(() => {
    gridApi = new GridApiMock();
    wrapper = shallow(
      <PureCoreModule {...props} userStore={new UserStoreMock()} groupStore={new GroupStoreMock()} />
    ).dive();
    instance = wrapper.instance() as any;
  });

  it('should be rendered without errors', () => {
    instance.gridApi = { ...gridApi, getSelectedNodes: () => [{ data: new UserResponseModel({ username: '' }) }] };
    expect(wrapper).to.be.ok;
  });

  it('should render searchHeader', () => {
    expect(searchHeader()).to.have.length(1);
  });

  it('should update searchValue and searchTypeChange it calls gridApi', () => {
    instance.gridApi = gridApi;

    // case update search value
    searchHeader().simulate('search', 'Test');
    expect(instance.searchValue).to.equal('Test');
    expect(gridApi.onFilterChanged.called).to.be.true;
    gridApi.onFilterChanged.resetHistory();

    // case update search type
    searchHeader().simulate('searchTypeChange', USER_FILTER.LAST_NAME);
    expect(instance.selectedOption).to.equal(USER_FILTER.LAST_NAME);
    expect(gridApi.onFilterChanged.called).to.be.true;
  });
});
