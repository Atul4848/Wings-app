import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ModelStatusOptions, AirportModel } from '@wings/shared';
import {
  GridOptions,
  ColDef,
  ValueFormatterParams,
  ICellEditorParams,
  RowNode,
  ColGroupDef,
  SortChangedEvent,
  GridReadyEvent,
  ColumnResizedEvent,
} from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import {
  AirportHoursModel,
  AirportHoursSubTypeModel,
  AirportHoursStore,
  AirportSettingsStore,
  AIRPORT_HOUR_FILTERS,
  AirportHourRemarksModel,
  AirportHoursTypeModel,
  useAirportModuleSecurity,
} from '../../../../Shared';
import { takeUntil, debounceTime, finalize } from 'rxjs/operators';
import { AxiosError } from 'axios';
import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  GridPagination,
  IAPIPageResponse,
  ISelectOption,
  UIStore,
  Utilities,
  regex,
  SettingsTypeModel,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { SCHEDULE_TYPE, ScheduleModel, scheduleTypeOptions, HoursTimeModel } from '@wings-shared/scheduler';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { DmSourceNotesRenderer } from './Components';
import airportHoursGridHelper from './AirportHoursGridHelper';
import { debounce } from '@material-ui/core';
import ConditionEditor from './Components/ConditionEditor/ConditionEditor';

export interface Props {
  ref?: any;
  isOtOrRecord?: boolean;
  isEditable?: boolean;
  airportModel?: AirportModel;
  rowData?: AirportHoursModel[];
  airportHoursType: AirportHoursTypeModel;
  airportHoursStore?: AirportHoursStore;
  airportSettingsStore?: AirportSettingsStore;
  airportHourSubTypes?: AirportHoursSubTypeModel[];
  onSaveChanges?: (updatedAirportHours: AirportHoursModel, rowIndex: number) => void;
  onColumnResized?: (source: string) => string;
  columnResizeSource?: string;
  onRowEditingStarted?: (isEditing: boolean) => void;
}

export interface IHoursGridRef {
  setTableData: (params) => void;
  addNewAirportHour: (params) => void;
  updateTableItem: (rowIndex, params) => void;
  autoSizeColumns: () => void;
  gridPagination: GridPagination;
}

const AirportHoursGrid = ({ isEditable, airportModel, airportHoursType, ...props }: Props, ref) => {
  const opsHoursByNotam: string = 'OPS Hours By NOTAM';
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_HOUR_FILTERS, AirportHoursModel>([], gridState);
  const airportModuleSecurity = useAirportModuleSecurity();
  const [ refreshKey, setRefreshKey ] = useState(Utilities.getTempId());

  const hourGrid = useRef(
    observable({
      isClosureTypeHours: false,
      isCIQTypeHours: false,
      isPPRHours: false,
      isOperationalHours: false,
      isSlotHours: false,
      isNoSchedule: false,
      isContinues: false,
      isSourceNotam: false,
      isSdtDst: false,
      is24Hours: false,
      isOTORHours: false,
    })
  ).current;

  const columnValues = useRef(observable({ hoursRemark: '', hoursSubType: '' })).current;

  const scheduleModel = observable({ data: new ScheduleModel() });

  const airportHoursRemarks = observable({ remarks: [] as AirportHourRemarksModel[] });

  const hoursType = useRef(observable({ label: airportHoursType?.label || '' })).current;

  const _airportHoursStore = props.airportHoursStore as AirportHoursStore;
  const _airportSettingsStore = props.airportSettingsStore as AirportSettingsStore;

  /* istanbul ignore next */
  // Load Data on Mount
  useEffect(() => {
    hoursType.label = airportHoursType?.label || '';
    gridState.isRowEditingStarted$.pipe(debounceTime(300), takeUntil(unsubscribe.destroy$)).subscribe(() => {
      setColumnValues();
      setEditorFlags();
      setAirportHoursRemarks();
      gridState.setHasError(true);
    });
  }, [ airportHoursType ]);

  /* istanbul ignore next */
  useImperativeHandle(
    ref,
    () => ({
      setTableData,
      addNewAirportHour,
      updateTableItem: (rowIndex, model) => {
        updateTableItem(rowIndex, model);
        setRefreshKey(Utilities.getTempId());
      },
      autoSizeColumns: () => agGrid.autoSizeColumns(),
      gridPagination: gridState.pagination,
    }),
    [ gridState.pagination ]
  );

  /* istanbul ignore next */
  useEffect(() => {
    setColumnVisible();
    if (props.onRowEditingStarted) {
      props.onRowEditingStarted(gridState.isRowEditing);
    }
    // Goto first page if hours sub Type or ICAO is changed 50410
    if (airportHoursType?.id || airportModel?.id) {
      gridState.gridApi?.paginationGoToFirstPage();
    }
  }, [ airportModel, airportHoursType, gridState.isRowEditing ]);

  /* istanbul ignore next */
  const setColumnVisible = (): void => {
    agGrid.setColumnVisible('actionRenderer', Boolean(isEditable) && !Boolean(airportModel?.inactive));
    gridState.setInitialColDefs(gridState.gridApi?.getColumnDefs() as ColGroupDef[]);
  };

  /* istanbul ignore next */
  const isCappsSequenceIdExist = (cappsSequenceId: number, currentId: number): boolean => {
    if (!cappsSequenceId) {
      return false;
    }
    return gridState.data.some(
      airportHours =>
        !Utilities.isEqual(currentId, airportHours.id) &&
        Utilities.isEqual(airportHours.cappsSequenceId, Number(cappsSequenceId))
    );
  };

  /* istanbul ignore next */
  // Schedule Type Change 49973
  const disableContinuesSchedule = (): boolean => {
    return (
      Utilities.isEqual(hoursType.label, 'SLOT') &&
      [ 'arrival/departure', 'arrival', 'departure' ].includes(columnValues.hoursSubType.trim().toLocaleLowerCase())
    );
  };

  // Set is No Schedule
  const setIsNoSchedule = (): void => {
    hourGrid.isNoSchedule =
      isOperational(columnValues.hoursSubType) &&
      columnValues.hoursRemark.toLowerCase().includes(opsHoursByNotam.toLowerCase());
  };

  const setIsContinues = (): void => {
    const scheduleType = agGrid.getInstanceValue<SettingsTypeModel>('schedule.scheduleType')?.value;
    hourGrid.isContinues = Utilities.isEqual(scheduleType, SCHEDULE_TYPE.CONTINUES);
  };

  // set capps comments rules based on hours type 51544
  const setCappsCommentRules = (): void => {
    const cappsCommentInstance = agGrid.getComponentInstance('cappsComment');
    const cappsCommentLimit = hourGrid.isPPRHours ? '16' : hourGrid.isCIQTypeHours ? '100' : '500';
    cappsCommentInstance?.setRules(`string|between:1,${cappsCommentLimit}`);
  };

  const setColumnValues = () => {
    columnValues.hoursRemark = agGrid.getInstanceValue<SettingsTypeModel>('airportHoursRemark')?.label || '';
    columnValues.hoursSubType = agGrid.getInstanceValue<AirportHoursSubTypeModel>('airportHoursSubType')?.label || '';
  };

  const setEditorFlags = (): void => {
    setIsNoSchedule();

    // check if it's schedule or not
    setIsContinues();

    // check if sourceTye is notam or not
    hourGrid.isSourceNotam = Utilities.isEqual(
      agGrid.getInstanceValue<SettingsTypeModel>('sourceType')?.label,
      'notam'
    );

    // Set SDT/DST Rules
    hourGrid.isSdtDst = Boolean(agGrid.getInstanceValue<SettingsTypeModel>('schedule.stddstType')?.value);

    // Set is24Hours Rules
    hourGrid.is24Hours = Boolean(agGrid.getInstanceValue<SettingsTypeModel>('schedule.is24Hours'));

    // check if it's a CIQ type Hours 45030,53432
    hourGrid.isCIQTypeHours = Utilities.isEqual(hoursType.label, 'ciq');

    // check if it's a PPR type Hours 46352
    hourGrid.isPPRHours = Utilities.isEqual(hoursType.label, 'PPR');

    // check if it's a Operational Hours 47264
    hourGrid.isOperationalHours = Utilities.isEqual(columnValues.hoursSubType, 'Operational Hours');

    // check if it's a OT/OR Hour Sub Type 164263
    hourGrid.isOTORHours = Utilities.isEqual(columnValues.hoursSubType, 'OT/OR Hours');

    // check if it's a SLOT Hours 49885
    hourGrid.isSlotHours = Utilities.isEqual(hoursType.label, 'SLOT');

    // check if it's closure type hours
    setIsClosureTypeHours();

    //Set StartTime EndTime values NOTE: Object used to get min/max values for date time
    scheduleModel.data = new ScheduleModel({
      startDate: agGrid.getInstanceValue('schedule.startDate'),
      endDate: agGrid.getInstanceValue('schedule.endDate'),
      startTime: agGrid.getInstanceValue('schedule.startTime'),
      endTime: agGrid.getInstanceValue('schedule.endTime'),
    });

    //set capps comment rules
    setCappsCommentRules();

    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    gridState.commonErrorMessage = Utilities.getErrorMessages(gridState.gridApi).toString();
  };

  /* istanbul ignore next */
  const setAirportHoursRemarks = (): void => {
    const airportHoursSubTypeId = agGrid.getInstanceValue<SettingsTypeModel>('airportHoursSubType')?.value;
    const _remarks = Utilities.customArraySort(
      _airportSettingsStore.airportHoursRemarks.filter(({ airportHoursSubType }) =>
        Utilities.isEqual(airportHoursSubType.id, airportHoursSubTypeId)
      ),
      'sequenceId'
    );
    airportHoursRemarks.remarks = _remarks;
  };

  const isOperational = (label: string): boolean => {
    return Utilities.isEqual(label, 'operational') || Utilities.isEqual(label, 'operational hours');
  };

  // Set Summary Hours for Summary information it should be in same order as displaying in grid
  // It will called ON SORTING CHANGE / DELETE / ADD / OTOR UPDATES
  const setSummaryHours = (): void => {
    if (gridState.sortFilters && gridState.sortFilters.length) {
      const airportHours: AirportHoursModel[] = [];
      // iterate only nodes that pass the filter and ordered by the sort order
      gridState.gridApi.forEachNodeAfterFilterAndSort(
        ({ data }: RowNode) => Boolean(data.id) && airportHours.push(data)
      );
      _airportHoursStore.summaryHours = Utilities.gridApiPaginatedData(gridState.gridApi, airportHours);
      return;
    }
    _airportHoursStore.summaryHours = Utilities.gridApiPaginatedData(gridState.gridApi, gridState.data);
  };

  /* istanbul ignore next */
  // needs to access using ref
  const updateTableItem = (rowIndex: number, airportHoursModel: AirportHoursModel): void => {
    agGrid._updateTableItem(rowIndex, airportHoursModel);
    gridState.setGridData(Utilities.customArraySort(gridState.data, 'cappsSequenceId'));
    _airportHoursStore.airportHours = gridState.data;
    setSummaryHours();
  };

  /* istanbul ignore next */
  // needs to access using ref
  const setTableData = (response: IAPIPageResponse<AirportHoursModel>): void => {
    gridState.setGridData(Utilities.customArraySort(response.results, 'cappsSequenceId'));
    gridState.setPagination(new GridPagination({ ...response }));
    setSummaryHours();
  };

  const isConditionAllowed = (): Boolean => {
    return Boolean(
      hourGrid.isPPRHours || hourGrid.isSlotHours || hourGrid.isCIQTypeHours ||
      hourGrid.isOTORHours || hourGrid.isClosureTypeHours || hourGrid.isOperationalHours
    )
  }

  // SET Closure Hours Flag
  const setIsClosureTypeHours = (): void => {
    hourGrid.isClosureTypeHours = Utilities.isEqual(columnValues.hoursSubType, 'closure hours');
    // clear condition object if it's not closure type or PPR hours or CIQ
    if (!isConditionAllowed()) {
      agGrid.getComponentInstance('conditions')?.setValue([]);
    }
  };

  // set capps comments based on conditions 48356
  const setCappsComments = (): void => {
    const notam: string = agGrid.getInstanceValue<string>('notam');
    const sourceType: string = agGrid.getInstanceValue<ISelectOption>('sourceType')?.label;
    const isOTORHours = Utilities.isEqual(columnValues.hoursSubType, 'OT/OR Hours');


    // Source TYPE= Notam
    if (Utilities.isEqual(sourceType, 'NOTAM') && notam?.trim()) {
      agGrid.getComponentInstance('cappsComment').setValue(`NTM ${notam}`);
      return;
    }

    if (isOTORHours) {
      agGrid.getComponentInstance('cappsComment').setValue('OT/OR');
      return;
    }

    // Operational Hours
    if (isOperational(hoursType.label)) {
      if (
        isOperational(columnValues.hoursSubType) &&
        Utilities.isEqual(columnValues.hoursRemark, 'LTD - Ops hours by NOTAM')
      ) {
        agGrid.getComponentInstance('cappsComment').setValue('OPS HRS BY NOTAM');
        return;
      }

      if (Utilities.isEqual(columnValues.hoursSubType, 'Tower Hours')) {
        agGrid.getComponentInstance('cappsComment').setValue('TOWER HOURS');
        return;
      }
      return;
    }

    // SLOT HOURS 49885
    if (Utilities.isEqual(hoursType.label, 'SLOT')) {
      if (Utilities.isEqual(columnValues.hoursSubType, 'NO SLOTS Available')) {
        agGrid.getComponentInstance('cappsComment').setValue('NO SLOTS Available');
        return;
      }

      if (Utilities.isEqual(columnValues.hoursRemark, 'ON/OFF Block Times')) {
        agGrid.getComponentInstance('cappsComment').setValue('ON/OFF Block Times');
        return;
      }

      if (Utilities.isEqual(columnValues.hoursRemark, 'Parking SLOT')) {
        agGrid.getComponentInstance('cappsComment').setValue('Parking SLOT');
      }
      return;
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, 'cappsSequenceId');
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveAirportHours(rowIndex);
        break;
      case GRID_ACTIONS.SAVE:
        gridState.gridApi.stopEditing();
        if (!props.isOtOrRecord) {
          const airportHour: AirportHoursModel = agGrid._getTableItem(rowIndex);
          if (props.onSaveChanges) {
            props.onSaveChanges(airportHour, rowIndex);
          }
          return;
        }
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex, !props.isOtOrRecord);
        setRefreshKey(Utilities.getTempId());
        break;
    }
  };

  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'ICAO',
      headerTooltip: 'ICAO/Airport Code',
      field: 'icao',
      minWidth: 100,
      maxWidth: 100,
      valueFormatter: ({ data }) => data.airport?.displayCode || data.icao,
      hide: Boolean(airportModel?.id) || props.isOtOrRecord,
    },
    {
      headerName: 'Seq',
      headerTooltip: 'Sequence ID',
      field: 'cappsSequenceId',
      maxWidth: 110,
      cellEditorParams: {
        isRequired: true,
        rules: `required|regex:${regex.numeric}`,
      },
    },
    {
      headerName: 'HST',
      headerTooltip: 'Hour Sub Type',
      field: 'airportHoursSubType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
        getAutoCompleteOptions: () => props.airportHourSubTypes || [],
      },
    },
    {
      headerName: 'Remark',
      field: 'airportHoursRemark',
      headerTooltip: 'Remark',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        getAutoCompleteOptions: () => airportHoursRemarks.remarks || [],
      },
    },
    {
      headerName: 'ST',
      headerTooltip: 'Schedule Type',
      field: 'schedule.scheduleType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        getAutoCompleteOptions: () => scheduleTypeOptions,
        getDisableState: (node: RowNode) => hourGrid.isNoSchedule || hourGrid.isOTORHours,
        getOptionDisabled: (optionA: SettingsTypeModel) =>
          Utilities.isEqual(optionA.id, SCHEDULE_TYPE.SINGLE_INSTANCE) ||
          (Utilities.isEqual(optionA.id, SCHEDULE_TYPE.CONTINUES) && disableContinuesSchedule()),
      },
    },
    {
      headerName: 'S/D',
      headerTooltip: 'STD/DST',
      field: 'schedule.stddstType',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        getAutoCompleteOptions: () => _airportSettingsStore.stddstTypes,
        getDisableState: (node: RowNode) =>
          Utilities.isEqual(airportHoursType.label, 'PPR') || hourGrid.isNoSchedule || hourGrid.isContinues,
      },
    },
    {
      headerName: 'Start Date',
      field: 'schedule.startDate',
      headerTooltip: 'Start Date',
      cellEditor: 'customTimeEditor',
      minWidth: 110,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        maxDate: () => scheduleModel.data?.endDate,
        isRequired: () => hourGrid.isContinues,
        getDisableState: (node: RowNode) => hourGrid.isSdtDst || hourGrid.isNoSchedule,
      },
    },
    {
      headerName: 'End Date',
      field: 'schedule.endDate',
      headerTooltip: 'End Date',
      cellEditor: 'customTimeEditor',
      minWidth: 110,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        isStartDateTime: false,
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        isRequired: () => hourGrid.isContinues,
        minDate: () => scheduleModel.data?.startDate,
        getDisableState: (node: RowNode) => hourGrid.isSdtDst || hourGrid.isNoSchedule,
      },
    },
    {
      headerName: 'Is 24',
      headerTooltip: 'Is 24 Hours',
      field: 'schedule.is24Hours',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellStyle: { ...cellStyle() },
      cellRendererParams: { readOnly: true },
      cellEditorParams: {
        getDisableState: (node: RowNode) => hourGrid.isNoSchedule || hourGrid.isContinues || hourGrid.isOTORHours,
      },
    },
    {
      headerName: 'Start Time LT',
      field: 'schedule.startTime',
      headerTooltip: 'Start Time LT',
      cellEditor: 'customTimeWidget',
      cellEditorParams: {
        format: DATE_FORMAT.API_TIME_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.TIME,
        isRequired: (node: RowNode) => hourGrid.isContinues || hourGrid.isOTORHours,
        isTimeOnly: (node: RowNode) => hourGrid.isContinues || hourGrid.isOTORHours,
        startDate: () => scheduleModel.data?.startDate,
        maxDate: () => scheduleModel.data?.endDateTime,
        ignoreDate: () => !Boolean(scheduleModel.data?.startDate) || !hourGrid.isContinues,
        getDisableState: (node: RowNode) => hourGrid.isNoSchedule || hourGrid.is24Hours,
      },
      valueFormatter: ({ value }: ValueFormatterParams) => value?.formattedSolarTime,
      comparator: (current, next) => Utilities.customDateComparator(current?.time, next?.time),
    },
    {
      headerName: 'End Time LT',
      field: 'schedule.endTime',
      headerTooltip: 'End Time LT',
      cellEditor: 'customTimeWidget',
      cellEditorParams: {
        isStartDateTime: false,
        timeLabel: 'End Time LT',
        format: DATE_FORMAT.API_TIME_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.TIME,
        isRequired: (node: RowNode) => hourGrid.isContinues || hourGrid.isOTORHours,
        isTimeOnly: (node: RowNode) => hourGrid.isContinues || hourGrid.isOTORHours,
        minDate: () => scheduleModel.data?.startDateTime,
        endDate: () => scheduleModel.data?.endDate,
        ignoreDate: () => !Boolean(scheduleModel.data?.endDate) || !hourGrid.isContinues,
        getDisableState: (node: RowNode) => hourGrid.isNoSchedule || hourGrid.is24Hours,
      },
      valueFormatter: ({ value }: ValueFormatterParams) => value?.formattedSolarTime,
      comparator: (current, next) => Utilities.customDateComparator(current?.time, next?.time),
    },
    {
      headerName: 'Recurrence Pattern',
      field: 'schedule.patternedRecurrence.recurrencePattern.daysOfWeeks',
      cellRenderer: 'customWeekDaysWidget',
      cellEditor: 'customWeekDaysWidget',
      minWidth: 210,
      maxWidth: 210,
      sortable: false,
      suppressSizeToFit: true,
      suppressMenu: true,
      cellEditorParams: {
        isRowEditing: true,
        isNoSchedule: () => hourGrid.isNoSchedule || hourGrid.isContinues,
        getDisableState: (node: RowNode) => hourGrid.isNoSchedule || hourGrid.isContinues,
      },
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      headerTooltip: 'Source Type',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        getAutoCompleteOptions: () => _airportSettingsStore.sourceTypes,
      },
    },
    {
      headerName: 'Source Notam',
      field: 'notam',
      headerTooltip: 'Source Notam',
      cellEditorParams: {
        ignoreNumber: true,
        getDisableState: (node: RowNode) => !hourGrid.isSourceNotam,
      },
    },
    {
      headerName: 'Conditions',
      headerTooltip: 'Conditions',
      field: 'conditions',
      cellRenderer: 'conditionEditor',
      minWidth: 90,
      cellRendererParams: {
        isRowEditing: false,
        settingsStore: _airportSettingsStore,
        getDisabledState: () => false,
      },
      cellEditor: 'conditionEditor',
      cellEditorParams: {
        isRowEditing: true,
        settingsStore: _airportSettingsStore,
        getDisabledState: () => !isConditionAllowed(),
      },
    },
    {
      headerName: 'IH',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      headerTooltip: 'Including Holidays',
      field: 'schedule.includeHoliday',
      maxWidth: 100,
      suppressSizeToFit: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: { readOnly: true },
      cellEditorParams: {
        getDisableState: (node: RowNode) => hourGrid.isNoSchedule || hourGrid.isContinues || hourGrid.isCIQTypeHours,
      },
    },
    {
      headerName: 'AL',
      headerTooltip: 'Access Level',
      field: 'accessLevel',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        isRequired: true,
        getAutoCompleteOptions: () => _airportSettingsStore.accessLevels,
      },
    },
    {
      headerName: 'Status',
      headerTooltip: 'Status',
      field: 'status',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'statusRenderer',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'CC',
      headerTooltip: 'CAPPS comments',
      field: 'cappsComment',
      cellEditor: 'customTextAreaEditor',
      cellEditorParams: {
        rules: 'string|between:1,500',
      },
    },
    {
      headerName: 'DM SN',
      headerTooltip: 'DM Source Notes',
      field: 'dmSourceNotes',
      cellRenderer: 'notesRenderer',
      cellEditor: 'customTextAreaEditor',
      cellEditorParams: {
        rules: 'string|between:1,300',
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        headerName: 'Actions',
        minWidth: 120,
        suppressMenu: true,
        hide: !airportModuleSecurity.isEditable,
      }),
    },
  ];

  /* istanbul ignore next */
  const removeAirportHours = (rowIndex: number): void => {
    const model: AirportHoursModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _airportHoursStore
      .removeAirportHours(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: string) => {
          agGrid._removeTableItems([ model ]);
          gridState.setGridData(gridState.data?.filter(({ id }) => model.id !== id));
          _airportHoursStore.airportHours = gridState.data;
          setSummaryHours();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const confirmRemoveAirportHours = (rowIndex: number): void => {
    const model: AirportHoursModel = agGrid._getTableItem(rowIndex);
    if (!Boolean(model.id)) {
      agGrid._removeTableItems([ model ]);
      return;
    }
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        removeAirportHours(rowIndex);
      },
      {
        isDelete: true,
        message: 'Are you sure you want to remove this Airport Hour?',
      }
    );
  };

  // Called from Ag Grid Component
  const onInputBlur = ({ colDef, data }: ICellEditorParams, value: string): void => {
    if (colDef.field === 'notam') {
      setCappsComments();
      setEditorFlags();
    }
  };

  // Called from Ag Grid Component
  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    switch (colDef.field) {
      case 'cappsSequenceId':
        const isCappsExist = isCappsSequenceIdExist(Number(Utilities.getNumberOrNullValue(value)), data.id);
        if (isCappsExist) {
          agGrid.getComponentInstance(colDef.field).setCustomError('CAPPS Sequence Id already Exist');
        }
        break;
      case 'schedule.is24Hours':
        if (value) {
          const startTime: HoursTimeModel = new HoursTimeModel({
            id: agGrid.getInstanceValue<HoursTimeModel>('schedule.startTime')?.id,
            time: airportHoursGridHelper.getDateTime(0, 1),
          });
          const endTime: HoursTimeModel = new HoursTimeModel({
            id: agGrid.getInstanceValue<HoursTimeModel>('schedule.endTime')?.id,
            time: airportHoursGridHelper.getDateTime(23, 59),
          });
          agGrid.getComponentInstance('schedule.startTime').setValue(startTime);
          agGrid.getComponentInstance('schedule.endTime').setValue(endTime);
        }
    }
    setEditorFlags();
  };

  const setIsOperationHandelByNotam = (): void => {
    const scheduleType = agGrid.getInstanceValue<SettingsTypeModel>('schedule.scheduleType')?.id;
    const value: ISelectOption = hourGrid.isNoSchedule
      ? scheduleTypeOptions[2]
      : Utilities.isEqual(scheduleType, SCHEDULE_TYPE.CONTINUES)
        ? scheduleTypeOptions[1]
        : scheduleTypeOptions[0];

    agGrid.getComponentInstance('schedule.scheduleType').setValue(value);
  };

  // Called from Ag Grid Component
  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    switch (colDef.field) {
      case 'airportHoursSubType':
      case 'airportHoursRemark':
        setColumnValues();
        setIsNoSchedule();
        setIsContinues();
        setIsOperationHandelByNotam();
        if (hourGrid.isNoSchedule) {
          airportHoursGridHelper.resetToDefault(agGrid, data);
        }
        if (colDef.field === 'airportHoursSubType') {
          agGrid.getComponentInstance('airportHoursRemark').setValue('');
          setAirportHoursRemarks();

          // if continues schedule not allowed then set schedule type to recurrence
          const isOTORSubType = Utilities.isEqual(value?.label, 'OT/OR Hours');
          if (disableContinuesSchedule() || isOTORSubType) {
            agGrid.getComponentInstance('schedule.scheduleType').setValue(scheduleTypeOptions[0]);
          }
        }
        setCappsComments();
        break;
      case 'sourceType':
        agGrid.getComponentInstance('notam').setValue('');
        setCappsComments();
        break;
      case 'schedule.scheduleType':
        if (value && Utilities.isEqual(value.value, SCHEDULE_TYPE.CONTINUES)) {
          airportHoursGridHelper.resetToDefault(agGrid, data);
        }
        break;
      case 'schedule.stddstType':
        agGrid.getComponentInstance('schedule.startDate').setValue('');
        agGrid.getComponentInstance('schedule.endDate').setValue('');
        break;
    }
    // Need Some delay to prepare editor components inside Grid
    debounce(() => setEditorFlags(), 200)();
  };

  /* istanbul ignore next */
  const addNewAirportHour = (newAirportHour: AirportHoursModel): void => {
    agGrid.addNewItems([ newAirportHour ], { startEditing: false, colKey: 'cappsSequenceId' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onDropDownChange, onInputChange, onInputBlur },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        isEditable: isEditable,
        getTooltip: () => gridState.commonErrorMessage,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => isEditable,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      suppressPaginationPanel: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        minWidth: 60,
        maxWidth: 260,
        suppressMovable: true,
        filter: false,
        cellRenderer: 'customCellRenderer',
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        notesRenderer: DmSourceNotesRenderer,
        conditionEditor: ConditionEditor,
      },
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!isEditable || airportModel?.inactive) {
          return;
        }
        agGrid._startEditingCell(Number(rowIndex), colDef.field || '');
        agGrid.setColumnVisible('icao', false);
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        setColumnVisible();
      },
      onSortChanged: (params: SortChangedEvent) => {
        agGrid.filtersApi.onSortChanged(params);
        setSummaryHours();
      },
      onRowEditingStarted: p => {
        const showIcao = props.isOtOrRecord ? false : !Boolean(airportModel?.id);
        agGrid.setColumnVisible('icao', showIcao);
        agGrid.onRowEditingStarted(p);
        if (props.onRowEditingStarted) {
          props.onRowEditingStarted(gridState.isRowEditing);
        }
      },
      onPaginationChanged: () => setSummaryHours(),
      onColumnResized: ({ source, finished }: ColumnResizedEvent) => {
        const { columnResizeSource } = props;
        if ((Utilities.isEqual(source, 'api') || Utilities.isEqual(source, 'flex')) && finished && columnResizeSource) {
          if (Utilities.isEqual(columnResizeSource, 'sizeColumnsToFit')) {
            gridState.gridApi.sizeColumnsToFit();
            return;
          }
          if (Utilities.isEqual(columnResizeSource, 'autosizeColumns')) {
            gridState.columnApi.autoSizeAllColumns();
            return;
          }
          return;
        }
        if (props.onColumnResized) {
          props.onColumnResized(source);
        }
      },
    };
  };

  return (
    <CustomAgGridReact
      serverPagination={true}
      rowData={props.isOtOrRecord ? props.rowData : gridState.data}
      hidePagination={props.isOtOrRecord}
      gridOptions={gridOptions()}
      paginationData={gridState.pagination}
      disablePagination={gridState.isRowEditing}
      onPaginationChange={({ pageNumber, pageSize }) => {
        gridState.setPagination(
          new GridPagination({ pageNumber, pageSize, totalNumberOfRecords: gridState.data?.length })
        );
        gridState.gridApi.paginationSetPageSize(pageSize);
        gridState.gridApi.paginationGoToPage(pageNumber - 1);
      }}
      key={`airportHour-${isEditable}-${props.airportHourSubTypes}-${refreshKey}`}
      isRowEditing={gridState.isRowEditing}
    />
  );
};

export default inject('airportSettingsStore', 'airportHoursStore')(observer(forwardRef(AirportHoursGrid)));
