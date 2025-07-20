import React, { FC, ReactNode, useEffect } from 'react';
import {
  GridOptions,
  ColDef,
  ICellEditorParams,
  ValueFormatterParams,
  SortChangedEvent,
  RowEditingStartedEvent,
} from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import {
  TimeZoneStore,
  TimeZoneSettingsStore,
  updateTimezoneSidebarOptions,
  TIME_ZONE_FILTERS,
  TimeZoneModel,
  ViewAirportDetails,
} from '../Shared';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  ViewPermission,
  IAPIGridRequest,
  GridPagination,
  DATE_FORMAT,
  SettingsTypeModel,
  regex,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Logger } from '@wings-shared/security';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { gridFilters } from './fields';
import { SidebarStore } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import moment from 'moment';
import ViewTimeZoneHistory from './Components/ViewTimeZoneHistory/ViewTimeZoneHistory';
import { AlertStore } from '@uvgo-shared/alert';
import { observable } from 'mobx';

interface Props {
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  timeZoneStore?: TimeZoneStore;
  sidebarStore?: typeof SidebarStore;
}

const CoreModule: FC<Props> = ({ timeZoneStore, timeZoneSettingsStore, sidebarStore }: Props) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<TIME_ZONE_FILTERS, TimeZoneModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const _useConfirmDialog = useConfirmDialog();
  const startAndEndDate = observable({ startDate: '', endDate: '' });

  const geographicModuleSecurity = useGeographicModuleSecurity();
  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Time Zones'), 'geographic');
    loadTimeZones();
  }, []);

  const viewAirports = (timezone: TimeZoneModel): void => {
    ModalStore.open(<ViewAirportDetails timeZoneId={timezone.timeZoneId} isStagingTimezones={false} />);
  };

  const clearDate = () => {
    startAndEndDate.startDate = '';
    startAndEndDate.endDate = '';
  };

  /*istanbul ignore next*/
  const deleteTimeZone = (model: TimeZoneModel): void => {
    UIStore.setPageLoader(true);
    _timeZoneStore
      .deleteTimeZone(model.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ model ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: () => (error: AxiosError) => AlertStore.info(error.message),
      });
  };

  const ConfirmDeleteTimezone = (rowIndex: number): void => {
    const model: TimeZoneModel = agGrid._getTableItem(rowIndex);
    _useConfirmDialog.confirmAction(
      () => {
        deleteTimeZone(model), ModalStore.close();
      },
      {
        isDelete: true,
      }
    );
  };

  const viewAuditHistory = (timezone: TimeZoneModel): void => {
    ModalStore.open(<ViewTimeZoneHistory timezoneId={timezone.timeZoneId} timezoneStore={_timeZoneStore} />);
  };

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    const field = params.colDef.field;
    const startDate = agGrid.getInstanceValue('startDateTime');
    const endDate = agGrid.getInstanceValue('endDateTime');
    switch (field) {
      case 'startDateTime':
        startAndEndDate.startDate = value;
        break;

      case 'endDateTime':
        startAndEndDate.endDate = value;
        break;
    }

    const isValidTime = Utilities.compareDateTime(startDate, endDate, DATE_FORMAT.API_FORMAT);
    if (!isValidTime) {
      AlertStore.critical('End Date and Time Should be after the Start Date and Time.');
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || !isValidTime);
  };

  /*istanbul ignore next*/
  const saveChanges = (rowIndex: number): void => {
    const data: TimeZoneModel = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _timeZoneStore
      .upsertTimeZone(data.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: TimeZoneModel) => {
          agGrid._updateTableItem(rowIndex, response);
          clearDate();
        },
        error: (error: AxiosError) => {
          Logger.error(error.message);
          AlertStore.critical(error.message);
        },
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.VIEW:
        viewAuditHistory(agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.DETAILS:
        viewAirports(agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        saveChanges(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        ConfirmDeleteTimezone(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        clearDate();
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Year',
      field: 'year',
      minWidth: 80,
      editable: false,
      headerTooltip: 'Year',
      sortable: false,
    },
    {
      headerName: 'Country',
      field: 'countryName',
      editable: false,
      headerTooltip: 'Country',
      sortable: false,
    },
    {
      headerName: 'Region Name',
      field: 'timeZoneRegion',
      minWidth: 120,
      cellEditor: 'customAutoComplete',
      sortable: false,
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Region',
        getAutoCompleteOptions: () => _timeZoneStore.timeZoneRegions,
        valueGetter: (option: SettingsTypeModel) => {
          return option;
        },
      },
      headerTooltip: 'Region Name',
    },
    {
      headerName: 'Zone Name',
      field: 'zoneName',
      cellEditorParams: {
        rules: 'string|between:1,50',
      },
      headerTooltip: 'Zone Name',
      sortable: false,
    },
    {
      headerName: 'ZA',
      field: 'zoneAbbreviation',
      minWidth: 80,
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,10',
      },
      headerTooltip: 'Zone Abbreviation',
      sortable: false,
    },
    {
      headerName: 'Offset',
      field: 'offset',
      minWidth: 80,
      cellEditorParams: {
        isRequired: true,
        rules: `required|string|max:6|regex:${regex.timeOffset}`,
      },
      headerTooltip: 'Offset',
      sortable: false,
    },
    {
      headerName: 'Zone DST',
      field: 'zoneDst',
      minWidth: 80,
      cellEditorParams: {
        isRequired: true,
        rules: 'required|numeric|digits_between:1,10',
      },
      headerTooltip: 'Zone DST',
      sortable: false,
    },
    {
      headerName: 'Old Local Time',
      field: 'oldLocalTime',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
      headerTooltip: 'Old Local Time',
      sortable: false,
    },
    {
      headerName: 'New Local Time',
      field: 'newLocalTime',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
      headerTooltip: 'New Local Time',
      sortable: false,
    },
    {
      headerName: 'Start Date and Time',
      field: 'startDateTime',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
      headerTooltip: 'Start Date and Time',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        maxDate: () => startAndEndDate?.endDate,
      },
      sortable: false,
    },
    {
      headerName: 'End Date and Time',
      field: 'endDateTime',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
      headerTooltip: 'End Date and Time',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        minDate: () => startAndEndDate?.startDate,
      },
      sortable: false,
    },
    ...agGrid.generalFields(_timeZoneSettingsStore),
    ...agGrid.auditFields(gridState.isRowEditing, false),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            { title: 'Edit', isHidden: !geographicModuleSecurity.isEditable, action: GRID_ACTIONS.EDIT },
            { title: 'Delete', isHidden: !geographicModuleSecurity.isEditable, action: GRID_ACTIONS.DELETE },
            { title: 'View Airports', action: GRID_ACTIONS.DETAILS },
            { title: 'View Timezone History', action: GRID_ACTIONS.VIEW },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onInputChange,
      },
      columnDefs: columnDefs,
      isEditable: geographicModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
      suppressRowHoverHighlight: true,
      pagination: false,
      onFilterChanged: () => loadTimeZones(),
      onSortChanged: (e: SortChangedEvent) => {
        agGrid.filtersApi.onSortChanged(e);
        loadTimeZones({ pageNumber: 1 });
      },

      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(params);
        _timeZoneSettingsStore?.getAccessLevels().subscribe();
        _timeZoneSettingsStore?.getSourceTypes().subscribe();
        _timeZoneStore?.loadTimeZoneRegion().subscribe();
      },
    };
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    if (!searchHeader.getFilters().searchValue) {
      return {};
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, searchHeader.getFilters().selectInputsValues.get('defaultOption'))
    );
    return {
      filterCollection: JSON.stringify([
        { [property?.columnId || '']: searchHeader.getFilters().searchValue, years: [] },
      ]),
    };
  };

  /* istanbul ignore next */
  const loadTimeZones = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...filterCollection(),
    };
    UIStore.setPageLoader(true);
    return _timeZoneStore
      .getTimeZones(false, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          gridState.setGridData(response.results);
          gridState.setPagination(new GridPagination({ ...response }));
        },
        error: (error: AxiosError) => Logger.error(error.message),
      });
  };

  // Add new TimeZone
  const addNewTimeZone = (): void => {
    const timeZone = new TimeZoneModel({
      timeZoneId: 0,
      year: new Date().getFullYear(),
      offset: '+00:00',
      zoneAbbreviation: '',
      zoneName: '',
      newLocalTime: moment().format(DATE_FORMAT.API_FORMAT),
      oldLocalTime: moment().format(DATE_FORMAT.API_FORMAT),
      utcLocalTime: moment().format(DATE_FORMAT.API_FORMAT),
      zoneOffset: 0,
      zoneDst: 0,
      zoneTotalOffset: 0,
      id: 0,
    });

    agGrid.addNewItems([ timeZone ], { startEditing: false, colKey: 'year' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={geographicModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing}
          onClick={() => addNewTimeZone()}
        >
          Add Time Zone
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(TIME_ZONE_FILTERS, TIME_ZONE_FILTERS.COUNTRY_NAME, 'defaultOption'),
        ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={loadTimeZones}
        onSearch={sv => loadTimeZones()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadTimeZones}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('timeZoneStore', 'timeZoneSettingsStore', 'sidebarStore')(observer(CoreModule));
