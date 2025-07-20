import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { GetCellEditorInstancesParams } from 'ag-grid-community/dist/lib/gridApi';
import sinon from 'sinon';
import { GridApiMock, IGridApi, ColumnApiMock } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import {
  AirportSettingsStoreMock,
  AirportHoursModel,
  AirportHoursStoreMock,
  AirportHoursTypeModel,
  ConditionTypeModel,
  ConditionModel,
  ConditionValueModel,
  ConditionalOperatorModel,
} from '../../Shared';
import { AccessLevelModel, Utilities, SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { ScheduleModel, scheduleTypeOptions } from '@wings-shared/scheduler';
import AirportHoursGrid from '../Components/AirportHoursDetails/AirportHoursGrid/AirportHoursGrid';
import airportHoursGridHelper from '../Components/AirportHoursDetails/AirportHoursGrid/AirportHoursGridHelper';

describe('Hours Grid Tests', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance: any;
  let gridApi: IGridApi;

  const airportSettingsStore = new AirportSettingsStoreMock();
  const airportData = new AirportHoursModel({
    id: 1,
    accessLevel: new AccessLevelModel({ id: 1, name: 'private' }),
    statusId: 1,
    sourceTypeId: 1,
    schedule: new ScheduleModel({ id: 1 }),
    condition: new ConditionModel({
      id: 1,
      conditionType: new ConditionTypeModel({ id: 1, name: 'Arrival' }),
      conditionalOperator: new ConditionalOperatorModel({ id: 1, name: '=' }),
      conditionValues: [new ConditionValueModel({ id: 1, entityValue: 'true' })],
    }),
  });

  const props = {
    airportHoursStore: new AirportHoursStoreMock(),
    airportSettingsStore,
    onChange: sinon.fake(),
    airportHoursType: new AirportHoursTypeModel({
      name: 'operational',
    }),
    onSaveChanges: sinon.fake(),
  };

  const changeValue = (field: string, data?: AirportHoursModel) => {
    return { colDef: { field }, data };
  };

  const editorInstance = (value, setValue?: sinon.SinonSpy) => [
    {
      getFrameworkComponentInstance: () => ({
        setValue: setValue || sinon.fake(),
        setRules: sinon.fake(),
        setEditorType: sinon.fake(),
        setConditionOperator: sinon.fake(),
      }),
      getValue: () => value,
      getGui: () => null,
    },
  ];

  const fakeSetValue = sinon.fake();

  beforeEach(() => {
    gridApi = new GridApiMock({ data: airportData });
    wrapper = shallow(
      <div>
        <AirportHoursGrid {...props} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(AirportHoursGrid)
      .shallow()
      .dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock();
    instance.columnApi = new ColumnApiMock();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call pagination method with CustomAgGridReact', () => {
    const paginationSetPageSize = sinon.fake();
    instance.gridApi = { ...gridApi, paginationSetPageSize, paginationGoToPage: sinon.fake() };
    wrapper.find(CustomAgGridReact).simulate('paginationChange', { pageNumber: 1, pageSize: 20 });
    expect(paginationSetPageSize.calledWith(20)).to.be.true;
  });

  it('should perform Grid actions', () => {
    const model = new AirportHoursModel({ id: 0 });
    gridApi = new GridApiMock({ data: model });
    instance.gridApi = gridApi;

    // No editing if no rowIndex provided
    expect(instance.gridActions(null, null)).to.equal(undefined);
    expect(gridApi.stopEditing.calledOnce).to.equal(false);

    // EDIT case
    instance.data = [airportData];
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(instance.gridApi.startEditingCell.calledOnce).to.be.true;

    // DELETE case
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    expect(gridApi.applyTransaction.calledWith({ remove: [model] })).to.be.true;
    expect(gridApi.redrawRows.called).to.be.true;

    // SAVE case
    instance.gridActions(GRID_ACTIONS.SAVE, 1);
    expect(gridApi.stopEditing.called).to.be.true;
    expect(props.onSaveChanges.calledOnce).to.be.true;

    // CANCEL case
    instance.gridActions(GRID_ACTIONS.CANCEL, 1);
    expect(gridApi.stopEditing.calledWith(true)).to.be.true;

    // Case: Default Grid action is Stop Editing
    instance.gridActions(null, 1);
    expect(gridApi.stopEditing.calledWith(true)).to.be.true;
  });

  it('should render GRID Action DELETE', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(ModalStore.data);
    expect(modalData.find('ConfirmDialog')).to.have.length(1);
  });

  it('should not call onSaveChanges with GRID SAVE Action', () => {
    props.onSaveChanges.resetHistory();
    wrapper.setProps({ props, isOtOrRecord: true });
    instance.gridActions(GRID_ACTIONS.SAVE, 1);
    expect(props.onSaveChanges.calledOnce).to.be.false;
  });

  it('should close dialog with confirm dialog no Click', () => {
    instance.gridApi = gridApi;
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmRemoveAirportHours(1);
    modal
      .childAt(0)
      .dive()
      .find('ConfirmDialog')
      .simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    instance.confirmRemoveAirportHours(1);
    expect(
      modal
        .childAt(0)
        .dive()
        .find('ConfirmDialog')
        .simulate('yesClick')
    ).to.be.ok;
  });

  it('should render updatedRowsData', () => {
    gridApi = new GridApiMock({ data: new AirportHoursModel({ id: 2 }) });
    instance.gridApi = gridApi;
    expect(Utilities.isEqual('Test', 'Test')).to.be.true;
  });

  it('should call setIsNoSchedule on change of airportHoursSubType and airportHoursRemark', () => {
    const setIsNoScheduleSpy = sinon.spy(instance, 'setIsNoSchedule');
    instance.onDropDownChange(changeValue('airportHoursSubType'), null);
    expect(setIsNoScheduleSpy.called).to.be.true;

    // On airport Hours Remark Change
    const setIsOperationHandelByNotamSpy = sinon.spy(instance, 'setIsOperationHandelByNotam');
    instance.onDropDownChange(changeValue('airportHoursRemark'), null);
    expect(setIsOperationHandelByNotamSpy.calledOnce).to.be.true;
  });

  it('should call resetToDefault if isNoSchedule is true on change of hours sub type', () => {
    sinon.stub(instance, 'setEditorFlags').returns(true);
    sinon.stub(instance, 'disableContinuesSchedule').value(true);
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        if (columns.includes('airportHoursSubType')) {
          return editorInstance(new SettingsTypeModel({ name: 'operational' }));
        }
        if (columns.includes('airportHoursRemark')) {
          return editorInstance(new SettingsTypeModel({ name: 'LTD - Ops hours by NOTAM' }));
        }
        return editorInstance('test');
      },
    };
    const resetToDefaultSpy = sinon.spy(airportHoursGridHelper, 'resetToDefault');
    instance.onDropDownChange(changeValue('airportHoursSubType', airportData), null);
    expect(resetToDefaultSpy.called).to.be.true;
  });

  it('should call resetToDefault change of scheduleType', () => {
    const resetToDefaultSpy = sinon.spy(airportHoursGridHelper, 'resetToDefault');
    // without Value
    instance.onDropDownChange(changeValue('schedule.scheduleType', airportData), null);
    expect(resetToDefaultSpy.called).to.be.false;
    // with Value
    instance.onDropDownChange(changeValue('schedule.scheduleType', airportData), scheduleTypeOptions[1]);
    expect(resetToDefaultSpy.called).to.be.true;
  });

  it('it should call setConditionRules on change of conditionType', () => {
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        if (columns.includes('condition.conditionType')) {
          return editorInstance(new SettingsTypeModel({ id: 1, name: 'Arrival' }));
        }
        if (columns.includes('cappsComment')) {
          return editorInstance('Test');
        }
        return editorInstance([new ConditionValueModel({ id: 1, entityValue: 'true' })]);
      },
    };

    const setConditionRulesSpy = sinon.spy(instance, 'setConditionRules');
    instance.onDropDownChange(changeValue('condition.conditionType'), null);
    expect(setConditionRulesSpy.called).to.be.true;

    instance.onDropDownChange(changeValue('condition.conditionType'), new SettingsTypeModel({ id: 1 }));
    expect(setConditionRulesSpy.called).to.be.true;
  });

  it('it should clear the value of notam on change of sourceType', () => {
    const getComponentInstance = sinon.spy(instance, 'getComponentInstance');
    instance.onDropDownChange(changeValue('sourceType'), null);
    expect(getComponentInstance.called).to.be.true;
  });

  it('it should clear the conditionValues on change of condition.conditionalOperator', () => {
    const getComponentInstance = sinon.spy(instance, 'getComponentInstance');
    instance.onDropDownChange(changeValue('condition.conditionalOperator'), []);
    expect(getComponentInstance.calledWith('condition.conditionValues')).to.be.true;
  });

  it('should render schedule.stddstType', () => {
    const getComponentInstance = sinon.spy(instance, 'getComponentInstance');
    instance.onDropDownChange(changeValue('schedule.stddstType'), null);
    expect(getComponentInstance.called).to.be.true;
  });

  it('should render schedule.is24Hours', () => {
    const getComponentInstance = sinon.spy(instance, 'getComponentInstance');
    instance.onInputChange(changeValue('schedule.is24Hours'), true);
    expect(getComponentInstance.called).to.be.true;
  });

  it('should check isCappsExist on change of cappsSequenceId', () => {
    const isCappsSequenceIdExistSpy = sinon.spy(instance, 'isCappsSequenceIdExist');
    instance.onInputChange(changeValue('cappsSequenceId', new AirportHoursModel({ id: 3 })), { id: 1 });
    expect(isCappsSequenceIdExistSpy.called).to.be.true;
  });

  it('should call setCustomError if isCappsExist on change of cappsSequenceId', () => {
    sinon.stub(instance, 'isCappsSequenceIdExist').returns(true);
    const setCustomError = sinon.fake();
    instance.gridApi = new GridApiMock({ setCustomError });
    instance.onInputChange(changeValue('cappsSequenceId', new AirportHoursModel({ id: 3 })), { id: 1 });
    expect(setCustomError.calledWith('CAPPS Sequence Id already Exist')).to.be.true;
  });

  it('isCappsSequenceIdExist return proper validation', () => {
    const gridData = [
      new AirportHoursModel({ id: 1, cappsSequenceId: 1 }),
      new AirportHoursModel({ id: 2, cappsSequenceId: 2 }),
    ];

    instance.setTableData({
      results: gridData,
      totalNumberOfRecords: gridData.length,
      pageNumber: 1,
      pageSize: 30,
    });
    // no capps id return false
    expect(instance.isCappsSequenceIdExist(null, 1)).to.be.false;

    // capps id return true capps id with different record
    expect(instance.isCappsSequenceIdExist(1, 3)).to.be.true;

    // ignore same airport hours
    expect(instance.isCappsSequenceIdExist(1, 1)).to.be.false;
  });

  it('should not set setCappsComments if comment already exist', () => {
    instance.gridApi = new GridApiMock({ getValue: 'Test' });
    const getComponentInstanceSpy = sinon.spy(instance, 'getComponentInstance');
    instance.setCappsComments();
    expect(getComponentInstanceSpy.called).to.be.false;
  });

  it('should not set CappsComments for no condition match', () => {
    fakeSetValue.resetHistory();
    wrapper.setProps({ ...props, airportHoursType: new SettingsTypeModel({ name: 'TEST' }) });
    instance.setCappsComments();
    expect(fakeSetValue.called).to.be.false;
  });

  it('should set setCappsComments if source type is NOTAM', () => {
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        if (columns.includes('notam')) {
          return editorInstance('TEST');
        }
        if (columns.includes('sourceType')) {
          return editorInstance(new SettingsTypeModel({ name: 'NOTAM' }));
        }
        return editorInstance('', fakeSetValue);
      },
    };
    instance.setCappsComments();
    expect(fakeSetValue.calledWith('NTM TEST')).to.be.true;
  });

  it('should setCappsComments for Operational Hours if remark is LTD - Ops hours by NOTAM', () => {
    sinon.stub(instance, 'setEditorFlags').returns(true);
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        if (columns.includes('airportHoursSubType')) {
          return editorInstance(new SettingsTypeModel({ name: 'operational' }));
        }
        if (columns.includes('airportHoursRemark')) {
          return editorInstance(new SettingsTypeModel({ name: 'LTD - Ops hours by NOTAM' }));
        }
        return editorInstance('');
      },
    };

    const setCappsCommentsSpy = sinon.spy(instance, 'setCappsComments');
    instance.onInputBlur(changeValue('notam', new AirportHoursModel({ ...airportData, id: null })));
    expect(setCappsCommentsSpy.called).to.be.true;
  });

  it('onInputBlur should not call setCappsComments if field is not notam', () => {
    const setCappsCommentsSpy = sinon.spy(instance, 'setCappsComments');
    instance.onInputBlur(changeValue('test', null));
    expect(setCappsCommentsSpy.called).to.be.false;
  });

  it('should set CappsComments for OT/OR if conditionType is Overtime', () => {
    instance.isClosureTypeHours = true;
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        return columns.includes('airportHoursSubType')
          ? editorInstance(new SettingsTypeModel({ name: 'operational' }))
          : columns.includes('condition.conditionType')
          ? editorInstance(new SettingsTypeModel({ name: 'Overtime' }))
          : editorInstance('', fakeSetValue);
      },
    };
    instance.setCappsComments();
    expect(fakeSetValue.calledWith('OT/OR')).to.be.true;
  });

  it('should set CappsComments Tower Hours if airportHoursSubType is Tower Hours', () => {
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        return columns.includes('airportHoursSubType')
          ? editorInstance(new SettingsTypeModel({ name: 'Tower Hours' }))
          : editorInstance('', fakeSetValue);
      },
    };
    instance.setCappsComments();
    expect(fakeSetValue.calledWith('TOWER HOURS')).to.be.true;
  });

  it('should set CappsComments for SLOT Hours if airportHoursSubType is NO SLOTS Available', () => {
    wrapper.setProps({ ...props, airportHoursType: new SettingsTypeModel({ name: 'SLOT' }) });
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        return columns.includes('airportHoursSubType')
          ? editorInstance(new SettingsTypeModel({ name: 'NO SLOTS Available' }))
          : editorInstance('', fakeSetValue);
      },
    };
    instance.setCappsComments();
    expect(fakeSetValue.calledWith('NO SLOTS Available')).to.be.true;
  });

  it('should set CappsComments for SLOT Hours if airportHoursRemark is ON/OFF Block Times', () => {
    wrapper.setProps({ ...props, airportHoursType: new SettingsTypeModel({ name: 'SLOT' }) });
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        return columns.includes('airportHoursRemark')
          ? editorInstance(new SettingsTypeModel({ name: 'ON/OFF Block Times' }))
          : editorInstance('', fakeSetValue);
      },
    };
    instance.setCappsComments();
    expect(fakeSetValue.calledWith('ON/OFF Block Times')).to.be.true;
  });

  it('should set CappsComments for SLOT Hours if airportHoursRemark is Parking SLOT', () => {
    wrapper.setProps({ ...props, airportHoursType: new SettingsTypeModel({ name: 'SLOT' }) });
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        return columns.includes('airportHoursRemark')
          ? editorInstance(new SettingsTypeModel({ name: 'Parking SLOT' }))
          : editorInstance('', fakeSetValue);
      },
    };
    instance.setCappsComments();
    expect(fakeSetValue.calledWith('Parking SLOT')).to.be.true;
  });

  it('should not set CappsComments for SLOT Hours if no condition match', () => {
    fakeSetValue.resetHistory();
    wrapper.setProps({ ...props, airportHoursType: new SettingsTypeModel({ name: 'SLOT' }) });
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: () => editorInstance('', fakeSetValue),
    };
    instance.setCappsComments();
    expect(fakeSetValue.called).to.be.false;
  });

  it('should update Summary hours with setSummaryHours', () => {
    instance.sortFilters = [{ sort: 'asc', colId: 'airport' }];
    instance.gridApi = {
      ...gridApi,
      forEachNodeAfterFilterAndSort: callback => [{ data: airportData }].forEach(callback),
    };
    instance.setSummaryHours();
    expect(instance.airportHoursStore.summaryHours).to.have.lengthOf(1);
  });

  it('should update isClosureTypeHours with setIsClosureTypeHours', () => {
    instance.gridApi = new GridApiMock({
      getValue: new SettingsTypeModel({ name: 'closure hours' }),
    });
    instance.setIsClosureTypeHours();
    expect(instance.isClosureTypeHours).to.be.true;
  });

  it('should set isNoSchedule with setIsNoSchedule', () => {
    instance.gridApi = {
      ...gridApi,
      getCellEditorInstances: ({ columns }: GetCellEditorInstancesParams) => {
        if (columns.includes('airportHoursSubType')) {
          return editorInstance(new SettingsTypeModel({ name: 'operational hours' }));
        }
        return editorInstance(new SettingsTypeModel({ name: 'LTD - Ops hours by NOTAM' }));
      },
    };
    instance.setIsNoSchedule();
    expect(instance.isNoSchedule).to.be.true;
  });

  it('should handle isNoSchedule conditions with setIsOperationHandelByNotam', () => {
    instance.isNoSchedule = true;
    instance.setIsOperationHandelByNotam();
    const setValueSpy: sinon.SinonSpy = instance.getComponentInstance('schedule.scheduleType').setValue;
    expect(setValueSpy.calledWith(scheduleTypeOptions[2])).to.be.true;
  });

  it('should handle continue conditions with setIsOperationHandelByNotam', () => {
    instance.gridApi = new GridApiMock({ getValue: scheduleTypeOptions[1] });
    instance.setIsOperationHandelByNotam();
    const setValueSpy: sinon.SinonSpy = instance.getComponentInstance('schedule.scheduleType').setValue;
    expect(setValueSpy.calledWith(scheduleTypeOptions[1])).to.be.true;
  });
});
