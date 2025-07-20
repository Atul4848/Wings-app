import React, { FC, ReactNode, useEffect } from 'react';
import { GridOptions, ColDef } from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import {
  TimeZoneDetailStore,
  TimeZoneStore,
  AirportLocationModel,
  TIME_ZONE_DETAIL_FILTERS,
  TimeZoneSettingsStore,
  updateTimezoneSidebarOptions,
} from '../Shared';
import { useStyles } from './AirportTimeZones.styles';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridGroupHeader,
  AgGridStatusBadge,
  useAgGrid,
  useGridState,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  Utilities,
  IClasses,
  GRID_ACTIONS,
  cellStyle,
  ViewPermission,
  IAPIGridRequest,
  GridPagination,
} from '@wings-shared/core';
import { ViewTimeZoneDetails } from './Shared/Components';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Logger } from '@wings-shared/security';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { VIEW_MODE } from '@wings/shared';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import UpsertAirportTimezone from './UpsertAirportTimezone/UpsertAirportTimezone';
import { gridFilters } from './fields';
import { SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  timeZoneDetailStore?: TimeZoneDetailStore;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  timeZoneStore?: TimeZoneStore;
  classes?: IClasses;
  isRegionUpdate?: boolean;
  sidebarStore?: typeof SidebarStore;
}

const AirportTimeZones: FC<Props> = ({
  timeZoneStore,
  timeZoneSettingsStore,
  timeZoneDetailStore,
  sidebarStore,
}: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<TIME_ZONE_DETAIL_FILTERS, AirportLocationModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const _timeZoneDetailStore = timeZoneDetailStore as TimeZoneDetailStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Airport Time Zones'), 'geographic');
    loadInitialData();
  }, []);

  // Update Airport Details
  /* istanbul ignore next */
  const openUpsertAirportTimezoneDialog = (
    viewMode: VIEW_MODE,
    rowIndex: number,
    model: AirportLocationModel
  ): void => {
    ModalStore.open(
      <UpsertAirportTimezone
        timeZoneDetailStore={_timeZoneDetailStore}
        timeZoneSettingsStore={_timeZoneSettingsStore}
        timeZoneStore={_timeZoneStore}
        viewMode={viewMode}
        airportLocationModel={model}
        onUpsertAirportTimezone={dataModel => {
          agGrid._updateTableItem(rowIndex, dataModel);
          loadInitialData();
        }}
      />
    );
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.PREVIEW:
        openUpsertAirportTimezoneDialog(VIEW_MODE.PREVIEW, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.VIEW:
        const data: AirportLocationModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(<ViewTimeZoneDetails airportId={data?.id} timeZoneDetailStore={_timeZoneDetailStore} />);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Airport Code',
      field: 'airportCode',
      minWidth: 110,
      flex: 1,
      headerTooltip: 'Airport Code',
    },
    {
      headerName: 'Region Name',
      field: 'timezoneRegionName',
      minWidth: 110,
      headerTooltip: 'Region Name',
    },
    {
      headerName: 'Local Time',
      field: 'localTime',
      minWidth: 150,
      flex: 1,
      headerTooltip: 'Local Time',
    },
    { headerName: 'Zulu Time', field: 'zuluTime', minWidth: 150, flex: 1, headerTooltip: 'Zulu Time', sortable: false },
    { headerName: 'Latitude Degrees', field: 'latitudeDegrees', headerTooltip: 'Latitude Degrees', sortable: false },
    { headerName: 'Longitude Degrees', field: 'longitudeDegrees', headerTooltip: 'Longitude Degrees', sortable: false },
    { headerName: 'Zone Name', field: 'currentZoneName', headerTooltip: 'Zone Name', sortable: false },
    {
      headerName: 'Zone Abbreviation',
      field: 'currentZoneAbbreviation',
      headerTooltip: 'Zone Abbreviation',
    },
    { headerName: 'OffSet', field: 'currentOffset', headerTooltip: 'OffSet', sortable: false },
    ...agGrid.generalFields(_timeZoneSettingsStore),
    ...agGrid.auditFields(gridState.isRowEditing, false),
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellStyle: cellStyle(),
      minWidth: 90,
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          {
            title: 'Update Region',
            isHidden: !geographicModuleSecurity.isEditable,
            action: GRID_ACTIONS.PREVIEW,
          },
          { title: 'View Details', action: GRID_ACTIONS.VIEW },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        sortable: false,
      },
      suppressClickEdit: true,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
        statusRenderer: AgGridStatusBadge,
      },
      onFilterChanged: () => loadInitialData(),
    };
  };

  /* istanbul ignore next */
  const getFilterCollection = (): IAPIGridRequest => {
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, searchHeader.getFilters().selectInputsValues.get('defaultOption'))
    );

    if (!searchHeader.getFilters().searchValue) {
      return {};
    }

    return {
      filterCollection: JSON.stringify([{ [property?.columnId || '']: searchHeader.getFilters().searchValue }]),
    };
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...getFilterCollection(),
    };
    UIStore.setPageLoader(true);
    _timeZoneDetailStore
      .getAirportTimeZones(request)
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

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={geographicModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing}
          onClick={() => {
            openUpsertAirportTimezoneDialog(VIEW_MODE.NEW, 0, new AirportLocationModel({ id: 0 }));
          }}
        >
          Add Airport Timezone
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
          agGridUtilities.createSelectOption(TIME_ZONE_DETAIL_FILTERS, TIME_ZONE_DETAIL_FILTERS.AIRPORT_CODE),
        ]}
        rightContent={rightContent}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject(
  'timeZoneDetailStore',
  'timeZoneStore',
  'timeZoneSettingsStore',
  'sidebarStore'
)(observer(AirportTimeZones));
