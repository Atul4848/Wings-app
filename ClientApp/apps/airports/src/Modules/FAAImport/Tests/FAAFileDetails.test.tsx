import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import {
  AirportStoreMock,
  FAA_IMPORT_COMPARISON_FILTERS,
  FAA_IMPORT_STAGING_ENTITY_TYPE,
  FAAImportProcess,
} from '../../Shared';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import FAAFileDetails from '../FAAFileDetails/FAAFileDetails';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { MemoryRouter } from 'react-router-dom';

describe('FAAFileDetails Module', () => {
  let wrapper: ReactWrapper;
  let agGridHelper: AgGridTestingHelper;

  const faaImportProcess = new FAAImportProcess({ id: 1, blobName: 'Test' });

  const props = {
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
    entityType: FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT,
    filters: FAA_IMPORT_COMPARISON_FILTERS.AIRPORT_NAME,
    isRunwayBySourceLocation: false,
  };

  beforeEach(() => {
    props.airportStore.selectedFaaImportProcess = faaImportProcess;
    wrapper = mount(
      <MemoryRouter>
        <FAAFileDetails {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(agGridHelper.getGridOptions().columnDefs).to.have.lengthOf(11);
  });
});
