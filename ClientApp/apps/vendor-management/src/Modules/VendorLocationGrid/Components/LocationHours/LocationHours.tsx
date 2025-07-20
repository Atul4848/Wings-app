import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  SelectOption,
  UIStore,
  Utilities,
  cellStyle,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { BaseStore, SettingsStore, VendorLocationStore } from '../../../../Stores';
import { useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import {
  AgGridCheckBox,
  AgGridMasterDetails,
  AgGridWeekDaysWidget,
  CustomAgGridReact,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import {
  SETTING_ID,
  SettingBaseModel,
  StatusBaseModel,
  useVMSModuleSecurity,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VENDOR_LOCATION_HOURS_FILTERS,
  VendorLocationModel,
  
} from '../../../Shared';
import { gridFilters, hoursGridFilters } from '../../../VendorLocationGrid/fields';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ColDef, GridOptions, RowNode, ValueFormatterParams, ICellEditorParams, ICellEditor } from 'ag-grid-community';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { IAPIResponseVendorLocationHours } from '../../../Shared/Interfaces/Response/API-Response-VendorLocation';
import { LocationHoursModel } from '../../../Shared/Models/LocationHours.model';
import { useStyles } from './LocationHours.styles';
import moment from 'moment';
import { ScheduleModel } from '../../../Shared/Models/Schedule.model';
import { HoursTimeModel } from '@wings-shared/scheduler';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';

interface Props {
  settingsStore: SettingsStore;
  vendorLocationStore: VendorLocationStore;
  params?: { vendorId: number; id: number };
}

const LocationHours: FC<Props> = ({ settingsStore, vendorLocationStore }) => {
  const params = useParams();
  const gridState = useGridState();
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
  const classes = useStyles();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const agGrid = useAgGrid<VENDOR_LOCATION_HOURS_FILTERS, LocationHoursModel>(hoursGridFilters, gridState);
  const unsubscribe = useUnsubscribe();

  useEffect(() => {
    loadLocationHours();
    loadVendorLocationData();
  }, []);

  const columnDefs: ColDef[] = [
    {
      headerName: 'Sequence ID',
      field: 'sequence',
      headerTooltip: 'Sequence ID',
      minWidth: 130,
      cellEditorParams: {
        placeHolder: 'Sequence ID',
        rules: 'required|integer|between:1,999',
      },
    },
    {
      headerName: 'Hours Type',
      field: 'hoursType',
      headerTooltip: 'Hours Type',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      minWidth: 130,
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.hoursType,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'Hours Type',
        ignoreNumber: true,
        isRequired: true,
        rules: 'required',
      },
    },
    {
      headerName: 'Schedule Type',
      field: 'hoursScheduleType',
      headerTooltip: 'Schedule Type',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      minWidth: 180,
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.hoursScheduleType,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'Hours Schedule Type',
        ignoreNumber: true,
        isRequired: true,
        rules: 'required',
      },
    },
    {
      headerName: 'Start Date',
      field: 'schedule.startDate',
      headerTooltip: 'Start Date',
      minWidth: 120,
      cellEditor: 'customTimeEditor',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        isRequired: () => (vendorLocationStore.isStartDateRequired ? true : false),
        placeHolder: 'Start Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        rules: `${vendorLocationStore.isStartDateRequired ? 'required' : ''}`,
      },
    },
    {
      headerName: 'End Date',
      field: 'schedule.endDate',
      headerTooltip: 'End Date',
      minWidth: 120,
      cellEditor: 'customTimeEditor',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        placeHolder: 'End Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        isRequired: () => (vendorLocationStore.isEndDateRequired ? true : false),
        rules: `${vendorLocationStore.isEndDateRequired ? 'required' : ''}`,
      },
    },
    {
      headerName: 'Is 24',
      field: 'schedule.is24Hours',
      headerTooltip: 'Is 24 Hours',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      cellEditor: 'checkBoxRenderer',
      minWidth: 90,
    },
    {
      headerName: 'Start Time Local',
      field: 'schedule.startTime',
      headerTooltip: 'Start Time Local',
      cellEditor: 'customTimeEditor',
      filter: false,
      minWidth: 150,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_TIME_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        placeHolder: 'Start Time Local',
        format: DATE_FORMAT.API_TIME_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.TIME,
        rules: 'required',
        isRequired: true,
        getDisableState: (node: RowNode) => vendorLocationStore.is24Hours,
      },
    },
    {
      headerName: 'End Time Local',
      field: 'schedule.endTime',
      headerTooltip: 'End Time Local',
      cellEditor: 'customTimeEditor',
      minWidth: 150,
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_TIME_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        placeHolder: 'End Time Local',
        format: DATE_FORMAT.API_TIME_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.TIME,
        rules: 'required',
        isRequired: true,
        getDisableState: (node: RowNode) => vendorLocationStore.is24Hours,
      },
    },
    {
      headerName: 'Recurrence Pattern',
      field: 'schedule.patternedRecurrence.patternedRecurrenceDaysofWeek',
      cellRenderer: 'customWeekDaysWidget',
      cellEditor: 'customWeekDaysWidget',
      minWidth: 210,
      maxWidth: 210,
      sortable: false,
      headerTooltip: 'Recurrence Pattern',
      suppressSizeToFit: true,
      suppressMenu: true,
      cellEditorParams: {
        isRowEditing: true,
        isNoSchedule: () => !Boolean(vendorLocationStore.isRecurrence),
        getDisableState: (node: RowNode) => !vendorLocationStore.isRecurrence,
      },
    },
    {
      headerName: 'Include Holiday',
      field: 'schedule.includeHoliday',
      headerTooltip: 'Include Holiday',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      cellEditor: 'checkBoxRenderer',
      minWidth: 150,
    },
    {
      headerName: 'Status',
      field: 'status',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Status',
      minWidth: 120,
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.status,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'Status',
        ignoreNumber: true,
        isRequired: true,
        rules: 'required',
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Access Level',
      minWidth: 140,
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.vendorAccessLevel,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'Access Level',
        ignoreNumber: true,
        isRequired: true,
        rules: 'required',
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  const loadLocationHours = (pageRequest?: IAPIGridRequest) => {
    gridState.setIsProcessing(true);
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Id',
          propertyValue: params.id,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    forkJoin([
      vendorLocationStore.getVendorLocationHours(request),
      settingsStore?.getSettings(SETTING_ID.SETTINGS_HOURS_TYPE, 'HoursType'),
      settingsStore?.getSettings(SETTING_ID.SETTINGS_HOURS_SCHEDULE_TYPE, 'ScheduleType'),
      settingsStore?.getSettings(SETTING_ID.SETTINGS_HOURS_STATUS, 'Status'),
      settingsStore?.getSettings(SETTING_ID.SETTING_ACCESS_LEVEL, 'AccessLevel'),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<IAPIResponseVendorLocationHours>]) => {
        response[0].totalNumberOfRecords = response[0].results.length;
        gridState.setPagination(new GridPagination({ ...response[0] }));
        gridState.setGridData(response[0]?.results);
        const allowSelectAll = response[0]?.totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const loadVendorLocationData = () => {
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.getVendorLocationById(parseInt(params.id))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorLocationModel) => {
        setSelectedVendorLocation(response);
      });
  };

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = params.column.getColId();
    switch (colId) {
      case 'schedule.is24Hours':
        if (value) {
          vendorLocationStore.is24Hours = true;
          const startTime = moment.utc(agGrid.fetchCellInstance('schedule.startTime')?.getValue());
          startTime.set({ hour: 0, minute: 1 });
          const endTime = moment.utc(agGrid.fetchCellInstance('schedule.endTime')?.getValue());
          endTime.set({ hour: 23, minute: 59 });
          agGrid.fetchCellInstance('schedule.startTime').setValue(startTime.toDate());
          agGrid.fetchCellInstance('schedule.endTime').setValue(endTime.toDate());
        } else {
          vendorLocationStore.is24Hours = false;
        }
        break;
      case 'schedule.startDate':
        const schedulTypeIdd = agGrid.fetchCellInstance('hoursScheduleType').getValue();
        if (schedulTypeIdd?.id === 1) {
          vendorLocationStore.isStartDateRequired = false;
        } else {
          if (!value) {
            vendorLocationStore.isStartDateRequired = true;
          } else {
            vendorLocationStore.isStartDateRequired = false;
          }
        }
        const startDate = moment(value);
        const endDateCol = agGrid.fetchCellInstance('schedule.endDate');
        const endDate = moment(endDateCol.getValue());
        if (startDate.isAfter(endDate, 'day')) {
          endDateCol.setValue(null);
          const schedulTypeId = agGrid.fetchCellInstance('hoursScheduleType').getValue();
          if (schedulTypeId?.id === 2) {
            vendorLocationStore.isEndDateRequired = true;
          }
        }
        break;
      case 'schedule.endDate':
        const schedulTypeId = agGrid.fetchCellInstance('hoursScheduleType').getValue();
        if (schedulTypeId?.id === 1) {
          vendorLocationStore.isEndDateRequired = false;
        } else {
          if (!value) {
            vendorLocationStore.isEndDateRequired = true;
          } else {
            vendorLocationStore.isEndDateRequired = false;
          }
        }
        const startCol = agGrid.fetchCellInstance('schedule.startDate');
        const startDatee = moment(startCol.getValue());
        const endDatee = moment(value);
        if (endDatee.isBefore(startDatee, 'day')) {
          BaseStore.showAlert('End Date cannot be less than Start Date', 0);
          agGrid.fetchCellInstance('schedule.endDate').setValue(null);
          if (schedulTypeId?.id === 2) {
            vendorLocationStore.isEndDateRequired = true;
          }
        } else if (startDatee.isAfter(endDatee, 'day')) {
          BaseStore.showAlert('Start Date cannot be greater than End Date', 0);
          agGrid.fetchCellInstance('schedule.startDate').setValue(null);
          if (schedulTypeId?.id === 2) {
            vendorLocationStore.isEndDateRequired = true;
          }
        }
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (colDef: ICellEditorParams, value): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = colDef.column.getColId();
    switch (colId) {
      case 'hoursScheduleType':
        if (value?.id === 2) {
          vendorLocationStore.isStartDateRequired = true;
          vendorLocationStore.isEndDateRequired = true;
          if (!agGrid.fetchCellInstance('schedule.startDate').getValue()) {
            agGrid.fetchCellInstance('schedule.startDate').setValue(new Date());
          }
          if (!agGrid.fetchCellInstance('schedule.endDate').getValue()) {
            agGrid.fetchCellInstance('schedule.endDate').setValue(new Date());
          }
          vendorLocationStore.isRecurrence = false;
        } else {
          vendorLocationStore.isStartDateRequired = false;
          vendorLocationStore.isEndDateRequired = false;
          vendorLocationStore.isRecurrence = true;
        }
        const startDate = agGrid.fetchCellInstance('schedule.startDate').getValue();
        const endDate = agGrid.fetchCellInstance('schedule.endDate').getValue();
        if (startDate && endDate) {
          vendorLocationStore.isStartDateRequired = false;
          vendorLocationStore.isEndDateRequired = false;
        }
        if (startDate) {
          vendorLocationStore.isStartDateRequired = false;
        }
        if (endDate) {
          vendorLocationStore.isEndDateRequired = false;
        }
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const saveRowData = (rowIndex: number) => {
    upsertVendorLocationHour(rowIndex);
  };

  const removeUnsavedRow = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    loadLocationHours();
  };

  const addLocationHour = (): void => {
    vendorLocationStore.isStartDateRequired = false;
    vendorLocationStore.isEndDateRequired = false;
    vendorLocationStore.is24Hours = false;
    vendorLocationStore.isRecurrence = true;
    const model: LocationHoursModel = new LocationHoursModel({
      status: StatusBaseModel.deserialize({
        id: 1,
        name: settingsStore?.status[0].name,
      }),
      accessLevel: StatusBaseModel.deserialize({
        id: 1,
        name: settingsStore?.vendorAccessLevel[0].name,
      }),
      // hoursScheduleType: SettingBaseModel.deserialize({
      //   id: settingsStore.hoursScheduleType[0].id,
      //   name: settingsStore.hoursScheduleType[0].name,
      // }),
      schedule: ScheduleModel.deserialize({
        startTime: HoursTimeModel.deserialize({
          time: '',
        }),
        endTime: HoursTimeModel.deserialize({
          time: '',
        }),
        startDate: null,
        endDate: null,
        scheduleType: SettingBaseModel.deserialize({
          id: settingsStore.hoursScheduleType[0].id,
          name: settingsStore.hoursScheduleType[0].name,
        }),
      }),
    });
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'sequence' });
    gridState.setHasError(true);
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: vmsModuleSecurityV2.isEditable,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: true,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: () => [
          {
            title: 'Edit',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.EDIT,
          },
          {
            title: 'Delete',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.DELETE,
          },
        ],
        getDisabledState: () =>
          gridState.hasError || vendorLocationStore.isStartDateRequired || vendorLocationStore.isEndDateRequired,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              const model = agGrid._getTableItem(rowIndex);
              if (model.schedule.is24Hours) {
                vendorLocationStore.is24Hours = true;
              } else {
                vendorLocationStore.is24Hours = false;
              }
              if (model.hoursScheduleType.id === 2) {
                if (!model.schedule.startDate) {
                  vendorLocationStore.isStartDateRequired = true;
                }
                if (!model.schedule.endDate) {
                  vendorLocationStore.isEndDateRequired = true;
                }
                vendorLocationStore.isRecurrence = false;
              } else {
                vendorLocationStore.isRecurrence = true;
              }
              agGrid._startEditingCell(rowIndex, 'sequence');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
            case GRID_ACTIONS.DELETE:
              confirmDelete(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: true,
      suppressClickEdit: true,
      suppressScrollOnNewData: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadLocationHours({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadLocationHours();
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        checkBoxRenderer: AgGridCheckBox,
        customWeekDaysWidget: AgGridWeekDaysWidget,
      },
    };
  };

  const deleteLocationHour = (rowIndex: number): void => {
    const model: LocationHoursModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    vendorLocationStore
      .deleteVendorLocationHour(model.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ model ]);
          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'sequence');
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const errorHandler = (errors: object, id): void => {
    Object.values(errors)?.forEach(errorMessage => BaseStore.showAlert(errorMessage[0], id));
  };

  const upsertVendorLocationHour = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.upsertVendorLocationHour(model.serialize(parseInt(params.id)))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: LocationHoursModel) => {
          response = LocationHoursModel.deserialize(response);
          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'sequence');
          if (error.response.data.errors) {
            errorHandler(error.response.data.errors, model.id.toString());
            return;
          }
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={selectedVendorLocation?.label} />}
        backNavTitle="Vendor Location"
        hideActionButtons={false}
        backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
        hasEditPermission={false}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  const getConfirmation = (rowIndex: number): void => {
    if (gridState.isAllRowsSelected) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Changes"
          message={'Cancelling will lost your changes. Are you sure you want to cancel?'}
          yesButton="Confirm"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => {
            ModalStore.close();
            removeUnsavedRow(rowIndex);
          }}
        />
      );
    } else {
      removeUnsavedRow(rowIndex);
    }
  };

  const confirmDelete = (rowIndex: number): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message={'Are you sure you want to remove this record?'}
        yesButton="Confirm"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          deleteLocationHour(rowIndex);
          ModalStore.close();
        }}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
        <div className={classes.gridHeight}>
          <AgGridMasterDetails
            addButtonTitle="Add Hours"
            onAddButtonClick={() => addLocationHour()}
            hasAddPermission={vmsModuleSecurityV2.isEditable}
            disabled={gridState.isProcessing || gridState.isRowEditing}
            resetHeight={true}
            isPrimaryBtn={true}
          >
            <CustomAgGridReact
              isRowEditing={gridState.isRowEditing}
              rowData={gridState.data}
              gridOptions={gridOptions()}
              serverPagination={false}
              paginationData={gridState.pagination}
              onPaginationChange={loadLocationHours}
              classes={{ customHeight: classes.customHeight }}
              disablePagination={gridState.isRowEditing || gridState.isProcessing}
            />
          </AgGridMasterDetails>
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('settingsStore', 'vendorLocationStore')(observer(LocationHours));
