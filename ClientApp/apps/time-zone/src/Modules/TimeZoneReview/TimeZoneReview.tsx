import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowNode, ColGroupDef } from 'ag-grid-community';
import { Theme } from '@material-ui/core';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import {
  ReviewActions,
  AIRPORT_TIME_ZONE_FILTERS,
  TimeZoneReviewStore,
  GridReviewActions,
  APPROVE_REJECT_ACTIONS,
  StagingAirportTimezoneModel,
  TIME_ZONE_REVIEW_FILTERS,
  StagingTimeZoneModel,
  ViewAirportDetails,
  updateTimezoneSidebarOptions,
} from '../Shared';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import {
  AccessLevelModel,
  SourceTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
  GRID_ACTIONS,
  cellStyle,
  DATE_FORMAT,
} from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  timeZoneReviewStore?: TimeZoneReviewStore;
  theme?: Theme;
  sidebarStore?: typeof SidebarStore;
}

const TimeZoneReview: FC<Props> = ({ timeZoneReviewStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const stagingStatus = observable([ 'Approved', 'Rejected' ]);
  const agGrid = useAgGrid<AIRPORT_TIME_ZONE_FILTERS, StagingAirportTimezoneModel>([], gridState);
  const _timeZoneReviewStore = timeZoneReviewStore as TimeZoneReviewStore;
  const _useConfirmDialog = useConfirmDialog();
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Time Zone Review'), 'geographic');
    loadInitialData();
  }, []);

  const setHasSelectedRow = (): void => {
    gridState.setHasSelectedRows(!!gridState.gridApi.getSelectedRows().length);
  };

  /* istanbul ignore next */
  const approveRejectTimeZones = (timeZones: StagingTimeZoneModel[], action: APPROVE_REJECT_ACTIONS): void => {
    const stagingTimeZoneIds: number[] = timeZones.map(x => x.id);
    UIStore.setPageLoader(true);
    _timeZoneReviewStore
      .approveRejectTimeZones(stagingTimeZoneIds, action)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          loadInitialData();
          gridState.gridApi.deselectAll();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const confirmChanges = (
    action: APPROVE_REJECT_ACTIONS,
    timeZones: StagingTimeZoneModel[],
    isMulti?: boolean
  ): void => {
    if (!timeZones?.length) return;
    const message: string = isMulti ? 'selected Time Zones' : 'selected Time Zone';
    _useConfirmDialog.confirmAction(
      () => {
        approveRejectTimeZones(timeZones, action), ModalStore.close();
      },
      {
        title: `Confirm ${action} ${message}`,
        message: `Are you sure you want to ${action} ${message}?`,
      }
    );
  };

  const gridActions = (action: GRID_ACTIONS, rowIndex: number): void => {
    const timeZone: StagingTimeZoneModel = gridState.gridApi?.getDisplayedRowAtIndex(rowIndex)?.data;
    if (!timeZone) {
      return;
    }
    switch (action) {
      case GRID_ACTIONS.APPROVE:
        confirmChanges(APPROVE_REJECT_ACTIONS.APPROVE, [ timeZone ], false);
        break;
      case GRID_ACTIONS.REJECT:
        confirmChanges(APPROVE_REJECT_ACTIONS.REJECT, [ timeZone ], false);
        break;
      case GRID_ACTIONS.DETAILS:
      default:
        ModalStore.open(<ViewAirportDetails stagingTimeZoneId={timeZone.id} isStagingTimezones={true} />);
        break;
    }
  };

  /* istanbul ignore next */
  const generalFields = (): (ColDef | ColGroupDef)[] => {
    return [
      {
        headerName: 'GD',
        groupId: 'generalDetails',
        suppressMenu: true,
        children: [
          {
            headerName: 'Staging Status',
            field: 'stagingStatusName',
            headerTooltip: 'Staging Status',
            headerComponent: 'customHeader',
            sortable: true,
            minWidth: 90,
            cellRenderer: 'statusRenderer',
          },
          {
            headerName: 'Access Level',
            field: 'accessLevel',
            columnGroupShow: 'open',
            sortable: true,
            minWidth: 90,
            headerTooltip: 'Access Level',
            comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
              Utilities.customComparator(current, next, 'name'),
            filter: false,
            valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
          },
          {
            headerName: 'Source Type',
            field: 'sourceType',
            headerTooltip: 'Source Type',
            columnGroupShow: 'open',
            sortable: true,
            comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
              Utilities.customComparator(current, next, 'name'),
            filter: false,
            valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: ({ data }) => !stagingStatus.includes(data.stagingStatusName),
      maxWidth: 60,
      headerName: '',
      hide: !geographicModuleSecurity.isEditable,
    },
    {
      headerName: 'Year',
      field: 'year',
      headerTooltip: 'Year',
      maxWidth: 90,
      minWidth: 90,
    },
    {
      headerName: 'Region Name',
      field: 'timezoneRegion.regionName',
      headerTooltip: 'Region Name',
      valueFormatter: ({ data }: ValueFormatterParams) => data?.timezoneRegion?.regionName,
    },
    {
      headerName: 'Country Code',
      field: 'timezoneRegion.countryCode',
      headerTooltip: 'Country Code',
      valueFormatter: ({ data }: ValueFormatterParams) => data?.timezoneRegion?.countryCode,
    },
    {
      headerName: 'Zone Name',
      field: 'zoneName',
      headerTooltip: 'Zone Name',
      minWidth: 120,
    },
    {
      headerName: 'Zone Abbreviation',
      field: 'zoneAbbreviation',
      headerTooltip: 'Zone Abbreviation',
      minWidth: 100,
    },
    {
      headerName: 'Old Local Time',
      field: 'oldLocalTime',
      headerTooltip: 'Old Local Time',
      minWidth: 130,
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Start Date and Time',
      field: 'startDateTime',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
      headerTooltip: 'Start Date and Time',
    },
    {
      headerName: 'End Date and Time',
      field: 'endDateTime',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
      headerTooltip: 'End Date and Time',
    },
    {
      headerName: 'Offset',
      field: 'offset',
      headerTooltip: 'Offset',
      maxWidth: 80,
    },
    {
      headerName: 'Zone DST',
      field: 'zoneDst',
      headerTooltip: 'Zone DST',
      maxWidth: 100,
    },
    {
      headerName: 'New Local Time',
      field: 'newLocalTime',
      headerTooltip: 'New Local Time',
      minWidth: 130,
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    ...generalFields(),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: '',
      cellRenderer: 'viewRenderer',
      minWidth: 180,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) => (
          <GridReviewActions
            disableInfo={UIStore.pageLoading || gridState.hasSelectedRows}
            isDisabled={
              UIStore.pageLoading || gridState.hasSelectedRows || stagingStatus.includes(data.stagingStatusName)
            }
            onAction={(action: GRID_ACTIONS) => gridActions(action, rowIndex)}
          />
        ),
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      suppressClickEdit: true,
      onRowSelected: () => setHasSelectedRow(),
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, zoneName, timezoneRegion, zoneAbbreviation, stagingStatusName } = node.data as StagingTimeZoneModel;
        if (!searchHeader) {
          return false;
        }
        return agGrid.isFilterPass(
          {
            [TIME_ZONE_REVIEW_FILTERS.REGION_NAME]: timezoneRegion?.regionName,
            [TIME_ZONE_REVIEW_FILTERS.COUNTRY_CODE]: timezoneRegion?.countryCode,
            [TIME_ZONE_REVIEW_FILTERS.ZONE_NAME]: zoneName,
            [TIME_ZONE_REVIEW_FILTERS.ZONE_ABBREVIATION]: zoneAbbreviation,
            [TIME_ZONE_REVIEW_FILTERS.STAGING_STATUS]: stagingStatusName,
          },
          searchHeader.getFilters().searchValue,
          searchHeader.getFilters().selectInputsValues.get('defaultOption')
        );
      },
    };
  };

  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _timeZoneReviewStore
      .loadStagingTimeZones()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const refreshTimeZone = (): void => {
    ModalStore.close();
    UIStore.setPageLoader(true);

    _timeZoneReviewStore
      .refreshTimeZones()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        switchMap(() => _timeZoneReviewStore.loadStagingTimeZones()),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: StagingTimeZoneModel[]) => (_timeZoneReviewStore.stagingTimeZones = response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
        },
      });
  };

  const confirmRefreshTimeZones = (): void => {
    _useConfirmDialog.confirmAction(
      () => {
        refreshTimeZone();
      },
      {
        title: 'Confirm Refresh Time Zone',
        message: 'Are you sure you want to Refresh Time Zone ?',
      }
    );
  };

  /* istanbul ignore next */
  const headerActions = (action: APPROVE_REJECT_ACTIONS): void => {
    const timezones: StagingTimeZoneModel[] = gridState.gridApi?.getSelectedRows();
    const isMultiple = timezones.length > 1 ? true : false;
    switch (action) {
      case APPROVE_REJECT_ACTIONS.APPROVE_SELECTED:
        confirmChanges(APPROVE_REJECT_ACTIONS.APPROVE, timezones, isMultiple);
        break;
      case APPROVE_REJECT_ACTIONS.REJECT_SELECTED:
        confirmChanges(APPROVE_REJECT_ACTIONS.REJECT, timezones, isMultiple);
        break;
      case APPROVE_REJECT_ACTIONS.REFRESH:
      default:
        confirmRefreshTimeZones();
        break;
    }
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={geographicModuleSecurity.isEditable}>
        <ReviewActions
          showRefreshButton={false}
          disabled={UIStore.pageLoading || !gridState.hasSelectedRows}
          onAction={(action: APPROVE_REJECT_ACTIONS) => headerActions(action)}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(TIME_ZONE_REVIEW_FILTERS, TIME_ZONE_REVIEW_FILTERS.REGION_NAME),
        ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('timeZoneReviewStore', 'sidebarStore')(observer(TimeZoneReview));
