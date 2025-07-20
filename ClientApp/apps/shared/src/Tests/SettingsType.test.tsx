import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SettingsType } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { GridApiMock } from '../Mocks';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS, NAME_TYPE_FILTERS, SettingsTypeModel } from '@wings-shared/core';

describe('Settings Type Module', function() {
  let wrapper: ShallowWrapper;
  let instance: any;
  const onUpsertFake = sinon.fake();
  const props = {
    onUpsert: onUpsertFake,
    rowData: [],
    onGetNewModel: () => sinon.fake(),
    type: '',
  };

  beforeEach(function() {
    wrapper = shallow(<SettingsType {...props} />);
    instance = wrapper.instance();
    instance.columnApi = { setColumnVisible: sinon.fake() };
    sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render CustomAgGridReact', function() {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should render SearchHeader', function() {
    expect(wrapper.find(SearchHeader)).to.have.length(1);
  });

  it('SearchHeader sets searchValue and it calls gridApi', function() {
    const gridApi = new GridApiMock();
    instance.gridApi = gridApi;
    wrapper.find(SearchHeader).simulate('search', 'Settings');
    expect(instance.searchValue).to.equal('Settings');
    expect(gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', function() {
    const onFilterChanged = sinon.spy();
    instance.gridApi = { onFilterChanged, getEditingCells: sinon.fake() };
    wrapper.find(SearchHeader).simulate('searchTypeChange', NAME_TYPE_FILTERS.NAME);
    expect(instance.selectedOption).to.equal(NAME_TYPE_FILTERS.NAME);
    expect(onFilterChanged.calledOnce).to.be.false;
  });

  it('Grid action SAVE should call API and update row', function() {
    instance.gridApi = {
      getEditingCells: sinon.fake(),
      getCellEditorInstances: () => [
        { getFrameworkComponentInstance: () => ({ setSelectedOption: sinon.spy(), hasError: false }) },
      ],
      stopEditing: () => null,
      getDisplayedRowAtIndex: () => ({ data: new SettingsType({ id: 0, name: 'Name' }), setData: sinon.spy() }),
    };
    instance.gridActions(GRID_ACTIONS.SAVE, 1);
    expect(onUpsertFake.calledOnce).to.be.true;
  });

  it('should call setData with Update Table Item', function() {
    const setData = sinon.spy();
    const data = new SettingsType({ id: 0, name: 'Name' });
    instance.gridApi = {
      stopEditing: () => null,
      getDisplayedRowAtIndex: () => ({ data, setData }),
      getEditingCells: sinon.fake(),
    };
    instance.updateTableItem(0, data);
    expect(setData.calledOnce).to.be.true;
  });

  it('Add State button should add new row', function() {
    const addNewTypeSpy = sinon.spy(instance, 'addNewType');
    wrapper
      .find(SearchHeader)
      .dive()
      .dive()
      .find(PrimaryButton)
      .simulate('click');
    expect(addNewTypeSpy.calledOnce).to.equal(true);
  });

  it('onInputChange sets hasError', function() {
    instance.gridApi = {
      getEditingCells: sinon.fake(),
      getCellEditorInstances: () => [
        { getFrameworkComponentInstance: () => ({ setSelectedOption: sinon.spy(), hasError: true }) },
      ],
    };

    instance.onInputChange();
    expect(instance.hasError).to.be.true;
  });

  it('should Grid action perform cases and default on Stop Editing', function() {
    const caller = sinon.spy();
    const ensureColumnVisible = sinon.spy();
    const startEditingCell = sinon.spy();
    instance.gridApi = {
      stopEditing: caller,
      ensureColumnVisible: ensureColumnVisible,
      startEditingCell: startEditingCell,
      getDisplayedRowAtIndex: () => ({ data: new SettingsTypeModel() }),
      applyTransaction: sinon.spy(),
      getEditingCells: sinon.fake(),
    };

    // No editing if no rowIndex provided
    expect(instance.gridActions(null, null)).to.equal(undefined);
    expect(caller.calledOnce).to.equal(false);

    // EDIT case
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(startEditingCell.calledWith({ rowIndex: 1, colKey: 'name' })).to.be.true;
    expect(ensureColumnVisible.calledOnce).to.be.true;

    // CANCEL case
    instance.gridActions(GRID_ACTIONS.CANCEL, 1);
    expect(caller.calledWith(true)).to.be.true;

    // default case
    instance.gridActions(null, 1);
    expect(caller.calledWith(true)).to.be.true;
  });

  it('Add  button should add new row', function() {
    const applyTransaction = sinon.spy();
    const redrawRows = sinon.spy();
    const startEditingCell = sinon.spy();
    const getFirstDisplayedRow = sinon.spy();
    const ensureIndexVisible = sinon.spy();

    instance.gridApi = {
      applyTransaction,
      startEditingCell,
      redrawRows,
      getFirstDisplayedRow,
      ensureIndexVisible,
      paginationGetPageSize: sinon.fake(),
      paginationGetCurrentPage: sinon.fake(),
      getEditingCells: sinon.fake(),
    };

    instance.addNewType();
    expect(instance.hasError).to.equal(true);
    expect(applyTransaction.calledOnce).to.equal(true);
    expect(redrawRows.calledOnce).to.equal(true);
    expect(startEditingCell.calledOnce).to.equal(true);
  });
});
