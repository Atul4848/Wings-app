import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ColumnApiMock, GridApiMock, IGridApi } from '@wings/shared';
import { AirportFlightPlanInfoModel, AirportMappingsBetaModel, AirportStoreMock } from '../../Shared';
import AirportMappingBeta from '../AirportMappingBeta';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';

describe('Airport Mappings Beta Module', function() {
  let wrapper: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;

  const props = {
    classes: {},
    airportStore: new AirportStoreMock(),
  };

  beforeEach(function() {
    wrapper = shallow(<AirportMappingBeta {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
    gridApi = new GridApiMock();
    instance.columnApi = new ColumnApiMock();
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader', function() {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeader)).to.have.length(1);
  });

  it('Grid action SAVE should call API and update rows', function() {
    gridApi = new GridApiMock({
      data: new AirportFlightPlanInfoModel({ navBlueCode: 'ABC', id: 1 }),
    });
    instance.gridApi = gridApi;
    const upsertAirportFlightPlanInfoSpy = sinon.spy(instance, 'upsertAirportFlightPlanInfo');
    instance.gridActions(GRID_ACTIONS.SAVE, 1);
    expect(upsertAirportFlightPlanInfoSpy.called).to.be.true;
  });

  it('should Grid action perform cases and default on Stop Editing', function() {
    gridApi = new GridApiMock({
      data: new AirportMappingsBetaModel({
        airportFlightPlanInfo: new AirportFlightPlanInfoModel({ navBlueCode: 'ABC' }),
      }),
    });
    instance.gridApi = gridApi;

    // No editing if no rowIndex provided
    expect(instance.gridActions(null, null)).to.equal(undefined);
    expect(gridApi.stopEditing.calledOnce).to.equal(false);

    // EDIT case
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(gridApi.startEditingCell.calledWith({ rowIndex: 1, colKey: 'airportFlightPlanInfo.navBlueCode' })).to.be
      .true;
    expect(gridApi.ensureColumnVisible.calledOnce).to.be.true;

    // CANCEL case
    instance.gridActions(GRID_ACTIONS.CANCEL, 1);
    expect(gridApi.stopEditing.calledWith(true)).to.be.true;
  });

  it('add click should add new row', function() {
    const addNewTypeSpy = sinon.spy(instance, 'addNewType');
    wrapper
      .find(SearchHeader)
      .dive()
      .dive()
      .find(PrimaryButton)
      .simulate('click');
    expect(addNewTypeSpy.called).to.be.true;
  });

  it('CustomAgGridReact should loadAirportMapping onPaginationChange', function() {
    const loadAirportMappingSpy = sinon.spy(instance, 'loadAirportMapping');
    wrapper.find(CustomAgGridReact).simulate('paginationChange');
    expect(loadAirportMappingSpy.called).to.be.true;
  });
});
