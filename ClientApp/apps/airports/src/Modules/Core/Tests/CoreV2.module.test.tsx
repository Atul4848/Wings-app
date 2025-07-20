import React from 'react';
import { mount, ReactWrapper, shallow } from 'enzyme';
import { expect } from 'chai';
import CoreModule from '../CoreV2.module';
import { AirportStoreMock } from '../../Shared/Mocks';
import { AgGridTestingHelper, AuditHistory } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import sinon from 'sinon';
import { AirportLocationModel, AirportModel, ICAOCodeModel } from '../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { MemoryRouter } from 'react-router-dom';

describe('Airports CoreV2 Module', () => {
  let wrapper: ReactWrapper;
  let agGridHelper: AgGridTestingHelper;
  const airportData = new AirportModel({
    id: 1,
    name: 'Chandigarh',
    icaoCode: new ICAOCodeModel({ id: 1, code: 'KHOU' }),
    airportLocation: new AirportLocationModel({ id: 5 }),
  });

  const props = {
    airportStore: new AirportStoreMock(),
    sidebarStore: SidebarStore,
  };
  const reRender = () => wrapper.setProps({ abc: Math.random() });

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <CoreModule {...props} />
      </MemoryRouter>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render CustomAgGridReact and SearchHeaderV3', () => {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 0);
    reRender();
    const auditHistory = shallow(ModalStore.data);
    expect(auditHistory).to.have.length(1);

    // else case
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, null);
    expect(wrapper.find(AuditHistory)).to.have.length(0);
  });
});
