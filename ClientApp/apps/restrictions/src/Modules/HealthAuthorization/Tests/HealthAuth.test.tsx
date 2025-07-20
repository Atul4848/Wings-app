import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { HealthAuthModel, HealthAuthStoreMock } from '../../Shared';
import HealthAuth from '../HealthAuth';
import * as sinon from 'sinon';
import { PrimaryButton } from '@uvgo-shared/buttons';

describe('Health Auth Module', () => {
  let wrapper: ShallowWrapper;
  const healthAuthModel = new HealthAuthModel();

  // repeated find methods
  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeaderV3);
  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);

  const props = {
    healthAuthStore: new HealthAuthStoreMock(),
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<HealthAuth {...props} />).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(searchHeader()).to.have.length(1);
    expect(customAgGridReact()).to.have.length(1);
  });

  it('should export Health excel file', () => {
    const exportHealthAuthExcelSpy = sinon.spy(props.healthAuthStore, 'getHealthAuthExcelFile');
    window.URL.createObjectURL = () => '';
    const primaryButton = wrapper
      .find(SearchHeaderV3)
      .dive()
      .dive()
      .find(PrimaryButton)
      .at(0);
    primaryButton.simulate('click');
    expect(exportHealthAuthExcelSpy.called).to.be.true;
  });
});
