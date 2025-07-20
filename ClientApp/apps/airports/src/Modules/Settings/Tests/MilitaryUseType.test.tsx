import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { AirportSettingsStoreMock } from '../../Shared';
import { MilitaryUseType } from '../Components';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('Military Use Type Setting Module', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(<MilitaryUseType {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.length(2);
  });
});
