/* eslint-disable no-debugger */
import React, { ReactNode } from 'react';
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
  RowEditingStartedEvent,
} from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import {
  AirportHoursModel,
  AirportHoursSubTypeModel,
  AirportHoursStore,
  AirportSettingsStore,
  AIRPORT_HOUR_FILTERS,
  AirportHourRemarksModel,
  AirportHoursTypeModel,
  ConditionModel,
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
  IBaseGridFilterSetup,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { SCHEDULE_TYPE, ScheduleModel, scheduleTypeOptions, HoursTimeModel } from '@wings-shared/scheduler';
import {
  AgGridCellEditor,
  BaseGrid,
  CustomAgGridReact,
  AgGridActions,
  AgGridAutoComplete,
  AgGridCheckBox,
  AgGridDateTimePicker,
  AgGridDateTimeWidget,
  AgGridWeekDaysWidget,
  AgGridGroupHeader,
  AgGridTextArea,
  AgGridCellRenderer,
  AgGridStatusBadge,
} from '@wings-shared/custom-ag-grid';
import { debounce } from '@material-ui/core';
import airportHoursGridHelper from './AirportHoursGridHelper';
import { DmSourceNotesRenderer } from './Components';
import ConditionEditor from './Components/ConditionEditor/ConditionEditor';

interface Props {
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
  onRowEditingStarted?: (event: RowEditingStartedEvent) => void;
}

const filterSetup: IBaseGridFilterSetup<AIRPORT_HOUR_FILTERS> = {
  defaultPlaceHolder: 'Search by Airport ICAO',
  defaultFilterType: AIRPORT_HOUR_FILTERS.ICAO,
  filterTypesOptions: Object.values(AIRPORT_HOUR_FILTERS),
};

@inject('airportHoursStore', 'airportSettingsStore')
@observer
class AirportHoursGrid extends BaseGrid<Props, AirportHoursModel, AIRPORT_HOUR_FILTERS> {
  private readonly closureConditionGroup: string = 'closureCondition';
  private readonly opsHoursByNotam: string = 'OPS Hours By NOTAM';
  @observable private isClosureTypeHours: boolean = false;
  @observable private isCIQTypeHours: boolean = false;
  @observable private isPPRHours: boolean = false;
  @observable private isOperationalHours: boolean = false;
  @observable private isSlotHours: boolean = false;
  @observable private isNoSchedule: boolean = false;
  @observable private isContinues: boolean = false;
  @observable private isSourceNotam: boolean = false;
  @observable private isSdtDst: boolean = false;
  @observable private scheduleModel: ScheduleModel;
  @observable private is24Hours: boolean = false;
  @observable private isOTORHours: boolean = false;
  @observable private airportHoursRemarks: AirportHourRemarksModel[] = [];

  /* istanbul ignore next */
  static defaultProps = {
    onColumnResized: () => '',
  };

  constructor(props) {
    super(props, filterSetup);
  }

  /* istanbul ignore next */
  componentDidMount() {
    this.isRowEditingStarted$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
      this.setEditorFlags();
      this.setAirportHoursRemarks();
      this.hasError = true;
    });
  }

  /* istanbul ignore next */
  componentDidUpdate(prevProps: Props) {
    if (
      this.props.isEditable !== prevProps.isEditable ||
      this.props.airportModel?.id !== prevProps.airportModel?.id ||
      this.props.airportModel?.inactive !== prevProps.airportModel?.inactive
    ) {
      this.setColumnVisible();
    }

    // Goto first page if hours sub Type or ICAO is changed 50410
    if (
      this.props.airportHoursType?.id !== prevProps.airportHoursType?.id ||
      this.props.airportModel?.id !== prevProps.airportModel?.id
    ) {
      this.gridApi?.paginationGoToFirstPage();
    }
  }

  private isCappsSequenceIdExist(cappsSequenceId: number, currentId: number): boolean {
    if (!cappsSequenceId) {
      return false;
    }
    return this.data.some(
      airportHours =>
        !Utilities.isEqual(currentId, airportHours.id) &&
        Utilities.isEqual(airportHours.cappsSequenceId, Number(cappsSequenceId))
    );
  }

  /* istanbul ignore next */
  private get airportHoursStore(): AirportHoursStore {
    return this.props.airportHoursStore as AirportHoursStore;
  }

  /* istanbul ignore next */
  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  public get hasErrorInGrid(): boolean {
    return this.hasError;
  }

  /* istanbul ignore next */
  private get airportHoursType(): string {
    return this.props.airportHoursType?.label || '';
  }

  /* istanbul ignore next */
  private get airportHoursSubType(): string {
    return this.getInstanceValue<SettingsTypeModel>('airportHoursSubType')?.label || '';
  }

  /* istanbul ignore next */
  private get airportHoursRemark(): string {
    return this.getInstanceValue<SettingsTypeModel>('airportHoursRemark')?.label || '';
  }

  /* istanbul ignore next */
  // Schedule Type Change 49973
  private get disableContinuesSchedule(): boolean {
    return (
      Utilities.isEqual(this.airportHoursType, 'SLOT') &&
      [ 'arrival/departure', 'arrival', 'departure' ].includes(this.airportHoursSubType.trim().toLocaleLowerCase())
    );
  }

  /* istanbul ignore next */
  public get isInactiveAirport(): boolean {
    return Boolean(this.props.airportModel?.inactive);
  }

  // needs to access using ref
  /* istanbul ignore next */
  public get gridPagination(): GridPagination {
    return this.pagination;
  }

  /* istanbul ignore next */
  public get gridRows(): AirportHoursModel[] {
    return this._getAllTableRows();
  }

  private get isConditionAllowed(): Boolean {
    // as per 163172
    return Boolean(
      this.isPPRHours || this.isSlotHours || this.isCIQTypeHours ||
      this.isOTORHours || this.isClosureTypeHours || this.isOperationalHours
    )
  }

  /* istanbul ignore next */
  private setColumnVisible(): void {
    this._setColumnVisible('actionRenderer', Boolean(this.props.isEditable) && !this.isInactiveAirport);
    this.initialColDefs = this.gridApi.getColumnDefs() as ColGroupDef[];
  }

  @action
  private setEditorFlags(): void {
    this.setIsNoSchedule();

    // check if it's schedule or not
    this.setIsContinues();

    // check if sourceTye is notam or not
    this.isSourceNotam = Utilities.isEqual(this.getInstanceValue<SettingsTypeModel>('sourceType')?.label, 'notam');

    // Set SDT/DST Rules
    this.isSdtDst = Boolean(this.getInstanceValue<SettingsTypeModel>('schedule.stddstType')?.value);

    // Set is24Hours Rules
    this.is24Hours = Boolean(this.getInstanceValue<SettingsTypeModel>('schedule.is24Hours'));

    // check if it's a CIQ type Hours 45030,53432
    this.isCIQTypeHours = Utilities.isEqual(this.airportHoursType, 'ciq');

    // check if it's a PPR type Hours 46352
    this.isPPRHours = Utilities.isEqual(this.airportHoursType, 'PPR');

    // check if it's a Operational Hours 47264
    this.isOperationalHours = Utilities.isEqual(this.airportHoursSubType, 'Operational Hours');

    // check if it's a OT/OR Hour Sub Type 164263
    this.isOTORHours = Utilities.isEqual(this.airportHoursSubType, 'OT/OR Hours');

    // check if it's a SLOT Hours 49885
    this.isSlotHours = Utilities.isEqual(this.airportHoursType, 'SLOT');

    // check if it's closure type hours
    this.setIsClosureTypeHours();

    // Set StartTime EndTime values NOTE: Object used to get min/max values for date time
    this.scheduleModel = new ScheduleModel({
      startDate: this.getInstanceValue('schedule.startDate'),
      endDate: this.getInstanceValue('schedule.endDate'),
      startTime: this.getInstanceValue('schedule.startTime'),
      endTime: this.getInstanceValue('schedule.endTime'),
    });

    //set capps comment rules
    this.setCappsCommentRules();

    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
    this.commonErrorMessage = Utilities.getErrorMessages(this.gridApi).toString();
  }

  /* istanbul ignore next */
  @action
  private setAirportHoursRemarks(): void {
    const airportHoursSubTypeId = this.getInstanceValue<SettingsTypeModel>('airportHoursSubType')?.value;
    this.airportHoursRemarks = Utilities.customArraySort(
      this.airportSettingsStore.airportHoursRemarks.filter(({ airportHoursSubType }) =>
        Utilities.isEqual(airportHoursSubType.id, airportHoursSubTypeId)
      ),
      'sequenceId'
    );
  }

  private isOperational(label: string): boolean {
    return Utilities.isEqual(label, 'operational') || Utilities.isEqual(label, 'operational hours');
  }

  /* istanbul ignore next */
  // needs to access using ref
  public updateTableItem(rowIndex: number, airportHoursModel: AirportHoursModel): void {
    this._updateTableItem(rowIndex, airportHoursModel);
    this.data = Utilities.customArraySort(this.data, 'cappsSequenceId');
    this.airportHoursStore.airportHours = this.data;
    this.setSummaryHours();
  }

  /* istanbul ignore next */
  // needs to access using ref
  @action
  public setTableData(response: IAPIPageResponse<AirportHoursModel>): void {
    this.data = Utilities.customArraySort(response.results, 'cappsSequenceId');
    this.pagination = new GridPagination({ ...response });
    this.setSummaryHours();
  }

  // Set Summary Hours for Summary information it should be in same order as displaying in grid
  // It will called ON SORTING CHANGE / DELETE / ADD / OTOR UPDATES
  @action
  public setSummaryHours(): void {
    if (this.sortFilters && this.sortFilters.length) {
      const airportHours: AirportHoursModel[] = [];
      // iterate only nodes that pass the filter and ordered by the sort order
      this.gridApi.forEachNodeAfterFilterAndSort(({ data }: RowNode) => Boolean(data.id) && airportHours.push(data));
      this.airportHoursStore.summaryHours = Utilities.gridApiPaginatedData(this.gridApi, airportHours);
      return;
    }
    this.airportHoursStore.summaryHours = Utilities.gridApiPaginatedData(this.gridApi, this.data);
  }

  // SET Closure Hours Flag
  @action
  private setIsClosureTypeHours(): void {
    this.isClosureTypeHours = Boolean(
      this.isOperational(this.airportHoursType) && Utilities.isEqual(this.airportHoursSubType, 'closure hours')
    );

    // clear condition object if it's not closure type or PPR hours or CIQ
    if (!this.isConditionAllowed) {
      this.getComponentInstance('conditions')?.setValue([]);
    }
  }

  // Set is No Schedule
  @action
  private setIsNoSchedule(): void {
    this.isNoSchedule =
      this.isOperational(this.airportHoursSubType) &&
      this.airportHoursRemark.toLowerCase().includes(this.opsHoursByNotam.toLowerCase());
  }

  @action
  private setIsContinues(): void {
    const scheduleType = this.getInstanceValue<SettingsTypeModel>('schedule.scheduleType')?.value;
    this.isContinues = Utilities.isEqual(scheduleType, SCHEDULE_TYPE.CONTINUES);
  }

  // set capps comments rules based on hours type 51544
  @action
  private setCappsCommentRules(): void {
    const cappsCommentInstance = this.getComponentInstance('cappsComment');
    const cappsCommentLimit = this.isPPRHours ? '16' : this.isCIQTypeHours ? '100' : '30';
    cappsCommentInstance?.setRules(`string|between:1,${cappsCommentLimit}`);
  }

  @action
  private setIsOperationHandelByNotam(): void {
    const scheduleType = this.getInstanceValue<SettingsTypeModel>('schedule.scheduleType')?.id;
    const value: ISelectOption = this.isNoSchedule
      ? scheduleTypeOptions[2]
      : Utilities.isEqual(scheduleType, SCHEDULE_TYPE.CONTINUES)
        ? scheduleTypeOptions[1]
        : scheduleTypeOptions[0];

    this.getComponentInstance('schedule.scheduleType').setValue(value);
  }

  // set capps comments based on conditions 48356
  @action
  private setCappsComments(): void {
    const notam: string = this.getInstanceValue<string>('notam');
    const sourceType: string = this.getInstanceValue<ISelectOption>('sourceType')?.label;
    const isOTORHours = Utilities.isEqual(this.airportHoursSubType, 'OT/OR Hours');

    // Source TYPE= Notam
    if (Utilities.isEqual(sourceType, 'NOTAM') && notam?.trim()) {
      this.getComponentInstance('cappsComment').setValue(`NTM ${notam}`);
      return;
    }

    // Operational Hours
    if (this.isOperational(this.airportHoursType)) {
      if (
        this.isOperational(this.airportHoursSubType) &&
        Utilities.isEqual(this.airportHoursRemark, 'LTD - Ops hours by NOTAM')
      ) {
        this.getComponentInstance('cappsComment').setValue('OPS HRS BY NOTAM');
        return;
      }

      if (isOTORHours) {
        this.getComponentInstance('cappsComment').setValue('OT/OR');
        return;
      }

      if (Utilities.isEqual(this.airportHoursSubType, 'Tower Hours')) {
        this.getComponentInstance('cappsComment').setValue('TOWER HOURS');
        return;
      }
      return;
    }

    // SLOT HOURS 49885
    if (Utilities.isEqual(this.airportHoursType, 'SLOT')) {
      if (Utilities.isEqual(this.airportHoursSubType, 'NO SLOTS Available')) {
        this.getComponentInstance('cappsComment').setValue('NO SLOTS Available');
        return;
      }

      if (Utilities.isEqual(this.airportHoursRemark, 'ON/OFF Block Times')) {
        this.getComponentInstance('cappsComment').setValue('ON/OFF Block Times');
        return;
      }

      if (Utilities.isEqual(this.airportHoursRemark, 'Parking SLOT')) {
        this.getComponentInstance('cappsComment').setValue('Parking SLOT');
      }
      return;
    }
  }

  /* istanbul ignore next */
  private columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'ICAO',
      headerTooltip: 'ICAO/Airport Code',
      field: 'icao',
      minWidth: 100,
      maxWidth: 100,
      valueFormatter: ({ data }) => data.airport?.displayCode || data.icao,
      hide: Boolean(this.props.airportModel?.id) || this.props.isOtOrRecord,
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
        getAutoCompleteOptions: () => this.props.airportHourSubTypes || [],
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
        getAutoCompleteOptions: () => this.airportHoursRemarks || [],
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
        getDisableState: (node: RowNode) => this.isNoSchedule || this.isOTORHours,
        getOptionDisabled: (optionA: SettingsTypeModel) =>
          Utilities.isEqual(optionA.id, SCHEDULE_TYPE.SINGLE_INSTANCE) ||
          (Utilities.isEqual(optionA.id, SCHEDULE_TYPE.CONTINUES) && this.disableContinuesSchedule),
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
        getAutoCompleteOptions: () => this.airportSettingsStore.stddstTypes,
        // enabled SDT/DST for CIQ hours as per 146797
        getDisableState: (node: RowNode) =>
          Utilities.isEqual(this.props.airportHoursType.label, 'PPR') || this.isNoSchedule || this.isContinues,
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
        maxDate: () => this.scheduleModel?.endDate,
        isRequired: () => this.isContinues,
        getDisableState: (node: RowNode) => this.isSdtDst || this.isNoSchedule,
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
        isRequired: () => this.isContinues,
        minDate: () => this.scheduleModel?.startDate,
        getDisableState: (node: RowNode) => this.isSdtDst || this.isNoSchedule,
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
        getDisableState: (node: RowNode) => this.isNoSchedule || this.isContinues || this.isOTORHours,
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
        isRequired: (node: RowNode) => this.isContinues || this.isOTORHours,
        isTimeOnly: (node: RowNode) => this.isContinues || this.isOTORHours,
        startDate: () => this.scheduleModel?.startDate,
        maxDate: () => this.scheduleModel?.endDateTime,
        ignoreDate: () => !Boolean(this.scheduleModel?.startDate) || !this.isContinues,
        getDisableState: (node: RowNode) => this.isNoSchedule || this.is24Hours,
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
        isRequired: (node: RowNode) => this.isContinues || this.isOTORHours,
        isTimeOnly: (node: RowNode) => this.isContinues || this.isOTORHours,
        minDate: () => this.scheduleModel?.startDateTime,
        endDate: () => this.scheduleModel?.endDate,
        ignoreDate: () => !Boolean(this.scheduleModel?.endDate) || !this.isContinues,
        getDisableState: (node: RowNode) => this.isNoSchedule || this.is24Hours,
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
        isNoSchedule: () => this.isNoSchedule || this.isContinues,
        getDisableState: (node: RowNode) => this.isNoSchedule || this.isContinues,
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
        getAutoCompleteOptions: () => this.airportSettingsStore.sourceTypes,
      },
    },
    {
      headerName: 'Source Notam',
      field: 'notam',
      headerTooltip: 'Source Notam',
      cellEditorParams: {
        ignoreNumber: true,
        getDisableState: (node: RowNode) => !this.isSourceNotam,
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
        settingsStore: this.airportSettingsStore,
      },
      cellEditor: 'conditionEditor',
      cellEditorParams: {
        isRowEditing: true,
        settingsStore: this.airportSettingsStore,
        // as per 163172
        getDisabledState: () => !this.isConditionAllowed
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
        getDisableState: (node: RowNode) => this.isNoSchedule || this.isContinues || this.isCIQTypeHours,
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
        getAutoCompleteOptions: () => this.airportSettingsStore.accessLevels,
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
        rules: 'string|between:1,30',
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
    ...this.auditFields,
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      filter: false,
      sortable: false,
      suppressSizeToFit: true,
      suppressMenu: true,
      minWidth: 120,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        this.columnApi.setColumnGroupOpened(this.closureConditionGroup, true);
        this._startEditingCell(rowIndex, 'cappsSequenceId');
        break;
      case GRID_ACTIONS.DELETE:
        this.confirmRemoveAirportHours(rowIndex);
        break;
      case GRID_ACTIONS.SAVE:
        this.gridApi.stopEditing();
        if (!this.props.isOtOrRecord) {
          const airportHour: AirportHoursModel = this._getTableItem(rowIndex);
          if (this.props.onSaveChanges) {
            this.props.onSaveChanges(airportHour, rowIndex);
          }
          return;
        }
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex, !this.props.isOtOrRecord);
        break;
    }
  }

  /* istanbul ignore next */
  private confirmRemoveAirportHours(rowIndex: number): void {
    const model: AirportHoursModel = this._getTableItem(rowIndex);
    if (!Boolean(model.id)) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Airport Hour?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          this.removeAirportHours(rowIndex);
        }}
      />
    );
  }

  /* istanbul ignore next */
  private removeAirportHours(rowIndex: number): void {
    const model: AirportHoursModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.airportHoursStore
      .removeAirportHours(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: string) => {
          this._removeTableItems([ model ]);
          this.data = this.data.filter(({ id }) => model.id !== id);
          this.airportHoursStore.airportHours = this.data;
          this.setSummaryHours();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  // Called from Ag Grid Component
  @action
  public onInputBlur({ colDef, data }: ICellEditorParams, value: string): void {
    if (colDef.field === 'notam') {
      this.setCappsComments();
      this.setEditorFlags();
    }
  }

  // Called from Ag Grid Component
  @action
  public onInputChange({ colDef, data }: ICellEditorParams, value: string): void {
    switch (colDef.field) {
      case 'cappsSequenceId':
        const isCappsExist = this.isCappsSequenceIdExist(Number(Utilities.getNumberOrNullValue(value)), data.id);
        if (isCappsExist) {
          this.getComponentInstance(colDef.field).setCustomError('CAPPS Sequence Id already Exist');
        }
        break;
      case 'schedule.is24Hours':
        if (value) {
          const startTime: HoursTimeModel = new HoursTimeModel({
            id: this.getInstanceValue<HoursTimeModel>('schedule.startTime')?.id,
            time: airportHoursGridHelper.getDateTime(0, 1),
          });
          const endTime: HoursTimeModel = new HoursTimeModel({
            id: this.getInstanceValue<HoursTimeModel>('schedule.endTime')?.id,
            time: airportHoursGridHelper.getDateTime(23, 59),
          });
          this.getComponentInstance('schedule.startTime').setValue(startTime);
          this.getComponentInstance('schedule.endTime').setValue(endTime);
        }
    }
    this.setEditorFlags();
  }

  // Called from Ag Grid Component
  @action
  public onDropDownChange({ colDef, data }: ICellEditorParams, value: ISelectOption): void {
    switch (colDef.field) {
      case 'airportHoursSubType':
      case 'airportHoursRemark':
        this.setIsNoSchedule();
        this.setIsContinues();
        this.setIsOperationHandelByNotam();
        if (this.isNoSchedule) {
          airportHoursGridHelper.resetToDefault(this, data);
        }
        if (colDef.field === 'airportHoursSubType') {
          // clear comments are it will be set by capps comment conditions
          this.getComponentInstance('cappsComment').setValue('');
          this.getComponentInstance('airportHoursRemark').setValue('');
          this.setAirportHoursRemarks();

          // if continues schedule not allowed then set schedule type to recurrence
          const isOTORSubType = Utilities.isEqual(value?.label, 'OT/OR Hours')
          if (this.disableContinuesSchedule || isOTORSubType) {
            this.getComponentInstance('schedule.scheduleType').setValue(scheduleTypeOptions[0]);
          }
        }
        this.setCappsComments();
        break;
      case 'sourceType':
        this.getComponentInstance('notam').setValue('');
        this.setCappsComments();
        break;
      case 'schedule.scheduleType':
        if (value && Utilities.isEqual(value.value, SCHEDULE_TYPE.CONTINUES)) {
          airportHoursGridHelper.resetToDefault(this, data);
        }
        break;
      case 'schedule.stddstType':
        this.getComponentInstance('schedule.startDate').setValue('');
        this.getComponentInstance('schedule.endDate').setValue('');
        break;
    }
    // Need Some delay to prepare editor components inside Grid
    debounce(() => this.setEditorFlags(), 200)();
  }

  /* istanbul ignore next */
  public addNewAirportHour(newAirportHour: AirportHoursModel): void {
    this.columnApi.setColumnGroupOpened(this.closureConditionGroup, true);
    this._addNewItems([ newAirportHour ], { startEditing: true, colKey: 'cappsSequenceId' });
    this.hasError = true;
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: [],
      isEditable: true,
      gridActionProps: {
        isEditable: this.props.isEditable,
        getTooltip: () => this.commonErrorMessage,
        getDisabledState: () => this.hasError,
        getEditableState: () => this.props.isEditable,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      suppressPaginationPanel: true,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!this.props.isEditable || this.isInactiveAirport) {
          return;
        }
        this.columnApi.setColumnGroupOpened(this.closureConditionGroup, true);
        this._startEditingCell(Number(rowIndex), colDef.field || '');
        this._setColumnVisible('icao', false);
      },
      onGridReady: (param: GridReadyEvent) => {
        this._onGridReady(param);
        this.setColumnVisible();
      },
      onSortChanged: (params: SortChangedEvent) => {
        this._onSortChanged(params);
        this.setSummaryHours();
      },
      onRowEditingStarted: p => {
        const showIcao = this.props.isOtOrRecord ? false : !Boolean(this.props.airportModel?.id);
        this._setColumnVisible('icao', showIcao);
        this._onRowEditingStarted(p);
        if (this.props.onRowEditingStarted) {
          this.props.onRowEditingStarted(p);
        }
      },
      onPaginationChanged: () => this.setSummaryHours(),
      onColumnResized: ({ source, finished }: ColumnResizedEvent) => {
        const { columnResizeSource } = this.props;
        if ((Utilities.isEqual(source, 'api') || Utilities.isEqual(source, 'flex')) && finished && columnResizeSource) {
          if (Utilities.isEqual(columnResizeSource, 'sizeColumnsToFit')) {
            this.gridApi.sizeColumnsToFit();
            return;
          }
          if (Utilities.isEqual(columnResizeSource, 'autosizeColumns')) {
            this.columnApi.autoSizeAllColumns();
            return;
          }
          return;
        }
        if (this.props.onColumnResized) {
          this.props.onColumnResized(source);
        }
      },
      columnDefs: this.columnDefs,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        minWidth: 60,
        maxWidth: 260,
        suppressMovable: true,
        filter: false,
        cellRenderer: 'customCellRenderer',
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
        checkBoxRenderer: AgGridCheckBox,
        customTimeEditor: AgGridDateTimePicker,
        customTimeWidget: AgGridDateTimeWidget,
        customWeekDaysWidget: AgGridWeekDaysWidget,
        customHeader: AgGridGroupHeader,
        customTextAreaEditor: AgGridTextArea,
        customCellRenderer: AgGridCellRenderer,
        statusRenderer: AgGridStatusBadge,
        notesRenderer: DmSourceNotesRenderer,
        conditionEditor: ConditionEditor,
      },
    };
  }

  public render(): ReactNode {
    const { isOtOrRecord, rowData } = this.props;
    return (
      <CustomAgGridReact
        serverPagination={true}
        rowData={isOtOrRecord ? rowData : this.data}
        gridOptions={this.gridOptions}
        paginationData={this.pagination}
        disablePagination={this.isRowEditing}
        onPaginationChange={({ pageNumber, pageSize }) => {
          this.pagination = new GridPagination({ pageNumber, pageSize, totalNumberOfRecords: this.data.length });
          this.gridApi.paginationSetPageSize(pageSize);
          this.gridApi.paginationGoToPage(pageNumber - 1);
        }}
      />
    );
  }
}

export default AirportHoursGrid;
export { AirportHoursGrid as PureHoursGrid };
