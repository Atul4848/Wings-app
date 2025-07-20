import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import classNames from 'classnames';
import { AgGridMasterDetails, useAgGrid, CustomAgGridReact, useGridState } from '@wings-shared/custom-ag-grid';
import { AlertStore } from '@uvgo-shared/alert';
import { observer } from 'mobx-react';
import { useStyles } from './RunwayClosure.styles';
import { useUnsubscribe, useConfirmDialog } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import {
  IAPIGridRequest,
  UIStore,
  Utilities,
  GRID_ACTIONS,
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  SourceTypeModel,
  regex,
} from '@wings-shared/core';
import {
  AirportSettingsStore,
  AirportStore,
  RUNWAY_CLOSURE_FILTERS,
  RunwayClosureModel,
  useAirportModuleSecurity,
} from '../../../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { observable } from 'mobx';
import moment from 'moment';
import { ModelStatusOptions } from '@wings/shared';

interface Props extends ICellRendererParams {
  airportStore: AirportStore;
  isMasterDetails?: boolean; // Showing in grid as child entity for regions screen
  isEditable?: boolean;
  isParentRowEditing?: () => boolean;
  onRowEditingChange?: (isRowEditing: boolean) => void;
  airportSettingsStore: AirportSettingsStore;
}

const RunwayClosure: FC<Props> = ({
  airportStore,
  isMasterDetails,
  isEditable,
  isParentRowEditing,
  data,
  airportSettingsStore,
}) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<RUNWAY_CLOSURE_FILTERS, RunwayClosureModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const _airportStore = airportStore as AirportStore;
  const startAndEndDate = observable({ startDate: '', endDate: '' });
  const _useConfirmDialog = useConfirmDialog();
  const airportModuleSecurity = useAirportModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    loadInitialData();
    airportSettingsStore.getSourceTypes().subscribe();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        { propertyName: 'RunwayId', propertyValue: data.id, operator: 'and', filterType: 'eq' },
      ]),
    };
    UIStore.setPageLoader(true);
    _airportStore
      .getRunwayClosure(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const _closures = response?.results?.map(x => new RunwayClosureModel({ ...x, runway_Id: data.runway_Id }));
        gridState.setGridData(_closures);
        agGrid.reloadColumnState();
      });
  };

  const clearDate = () => {
    startAndEndDate.startDate = '';
    startAndEndDate.endDate = '';
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertRunwayClosure(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        clearDate();
        break;
    }
  };

  const confirmRemoveRecord = (rowIndex: number): void => {
    const model: RunwayClosureModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteRecord(rowIndex);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteRecord(rowIndex), { isDelete: true });
  };

  /* istanbul ignore next */
  const deleteRecord = (rowIndex: number): void => {
    const rowData: RunwayClosureModel = agGrid._getTableItem(rowIndex);
    rowData.airportId = data.airportId;
    UIStore.setPageLoader(true);
    airportStore
      .removeRunwayClosures(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          ModalStore.close();
          agGrid._removeTableItems([ rowData ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const upsertRunwayClosure = (rowIndex: number): void => {
    const rowData: RunwayClosureModel = agGrid._getTableItem(rowIndex);
    rowData.runwayId = data.id;
    rowData.airportId = data.airportId;
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    airportStore
      .upsertAirportRunwayClosure(rowData.serialize())
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: (response: RunwayClosureModel) => {
          const _closuresUpsert = new RunwayClosureModel({ ...response, runway_Id: data.runway_Id });
          agGrid._updateTableItem(rowIndex, _closuresUpsert);
          clearDate();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  /* istanbul ignore next */
  const addRunwayClosure = (): void => {
    const _sourceType = airportSettingsStore?.sourceTypes.find(x => x.name === 'CAPPS');
    const runwayClosureModel = new RunwayClosureModel({
      id: 0,
      runway_Id: data.runway_Id,
      sourceType: new SourceTypeModel(_sourceType as SourceTypeModel),
    });
    const colKey: string = 'notamId';
    agGrid.addNewItems([ runwayClosureModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  const generalFields = () => {
    return [
      {
        headerName: 'GD',
        groupId: 'generalDetails',
        suppressMenu: true,
        children: [
          {
            headerName: 'Source Type',
            field: 'sourceType',
            headerComponent: 'customHeader',
            cellEditor: 'customAutoComplete',
            headerTooltip: 'Source Type',
            comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
            filter: false,
            valueFormatter: ({ value }) => value?.label || '',
            cellEditorParams: {
              isRequired: true,
              placeHolder: 'Source Type',
              getAutoCompleteOptions: () => airportSettingsStore.sourceTypes,
            },
          },
          {
            headerName: 'Status',
            field: 'status',
            columnGroupShow: 'open',
            cellRenderer: 'statusRenderer',
            cellEditor: 'customAutoComplete',
            headerTooltip: 'Status',
            comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
            filter: false,
            valueFormatter: ({ value }) => value?.label || '',
            cellEditorParams: {
              isRequired: true,
              placeHolder: 'Status',
              getAutoCompleteOptions: () => ModelStatusOptions,
            },
          },
          {
            headerName: 'Access Level',
            field: 'accessLevel',
            cellEditor: 'customAutoComplete',
            columnGroupShow: 'open',
            headerTooltip: 'Access Level',
            comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
            filter: false,
            valueFormatter: ({ value }) => value?.label || '',
            cellEditorParams: {
              isRequired: true,
              placeHolder: 'Access Level',
              getAutoCompleteOptions: () => airportSettingsStore.accessLevels,
            },
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Runway',
      field: 'runway_Id',
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'NOTAM ID',
      field: 'notamId',
      headerTooltip: 'Notam Id',
      cellEditorParams: {
        ignoreNumber: true,
        rules: `required|between:1,20|regex:${regex.alphaNumericWithHyphen}`,
      },
    },
    {
      headerName: 'Start Date',
      field: 'closureStartDate',
      headerTooltip: 'Start Date',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        isRequired: true,
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        maxDate: () => startAndEndDate.endDate,
      },
    },
    {
      headerName: 'Start Time',
      field: 'closureStartTime',
      headerTooltip: 'Start Time',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.APPOINTMENT_TIME) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        isRequired: true,
        format: DATE_FORMAT.APPOINTMENT_TIME,
        pickerType: DATE_TIME_PICKER_TYPE.TIME,
      },
    },
    {
      headerName: 'End Date',
      field: 'closureEndDate',
      headerTooltip: 'End Date',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        isRequired: true,
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        minDate: () => startAndEndDate.startDate,
      },
    },
    {
      headerName: 'End Time',
      field: 'closureEndTime',
      headerTooltip: 'End Time',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.APPOINTMENT_TIME) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        isRequired: true,
        format: DATE_FORMAT.APPOINTMENT_TIME,
        pickerType: DATE_TIME_PICKER_TYPE.TIME,
      },
    },
    ...generalFields(),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: false,
          actionMenus: () => [
            { title: 'Edit', isHidden: !isEditable, action: GRID_ACTIONS.EDIT },
            { title: 'Delete', isHidden: !isMasterDetails, action: GRID_ACTIONS.DELETE },
          ],
        },
      }),
    },
  ];

  const onInputChange = (params, value: string) => {
    const field = params.colDef.field;
    const closureStartTime = agGrid.getInstanceValue('closureStartTime');
    const closureEndTime = agGrid.getInstanceValue('closureEndTime');

    switch (field) {
      case 'closureStartDate':
      case 'closureStartTime':
        if (field === 'closureStartDate') {
          startAndEndDate.startDate = value;
        }
        updateDateTime('closureStartTime', value, closureStartTime);
        break;

      case 'closureEndDate':
      case 'closureEndTime':
        if (field === 'closureEndDate') {
          startAndEndDate.endDate = value;
        }
        updateDateTime('closureEndTime', value, closureEndTime);
        break;
    }
    const isValidDate = Utilities.isEqual(
      moment(agGrid.getInstanceValue('closureStartDate')).format(DATE_FORMAT.API_DATE_FORMAT),
      moment(agGrid.getInstanceValue('closureEndDate')).format(DATE_FORMAT.API_DATE_FORMAT)
    );
    const isValidTime = Utilities.compareDateTime(closureStartTime, closureEndTime, DATE_FORMAT.API_TIME_FORMAT);

    if (!isValidTime && isValidDate) {
      AlertStore.critical('End Date and Time Should be after the Start Date and Time.');
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || (!isValidTime && isValidDate));
  };

  function updateDateTime(fieldName, newValue, originalValue) {
    const formattedNewValue = moment(newValue).format(DATE_FORMAT.API_DATE_FORMAT);
    const originalTime = originalValue ? originalValue.substr(11) : '00:00:00';
    const updatedValue = `${formattedNewValue}T${originalTime}`;
    agGrid.fetchCellInstance(fieldName).setValue(updatedValue);
  }

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        hideActionButtons: !isEditable,
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        airportSettingsStore.getAccessLevels().subscribe();
      },
    };
  };

  return (
    <div className={classNames({ [classes.root]: true, [classes.masterDetails]: !isMasterDetails })}>
      <AgGridMasterDetails
        addButtonTitle="Add Runway Closure"
        onAddButtonClick={() => addRunwayClosure()}
        hasAddPermission={airportModuleSecurity.isEditable}
        disabled={!isEditable || UIStore.pageLoading || gridState.hasError || gridState.isRowEditing}
        key={`master-details-${isEditable}-${isParentRowEditing}`}
      >
        <CustomAgGridReact
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing}
          classes={{ customHeight: classes.customHeight }}
        />
      </AgGridMasterDetails>
    </div>
  );
};

export default observer(RunwayClosure);
