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
  updateTimezoneSidebarOptions,
} from '../Shared';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import {
  AccessLevelModel,
  SourceTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
  GRID_ACTIONS,
  cellStyle,
  SettingsTypeModel,
} from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { AxiosError } from 'axios';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  timeZoneReviewStore?: TimeZoneReviewStore;
  theme?: Theme;
  sidebarStore?: typeof SidebarStore;
}

const AirportTimeZoneReview: FC<Props> = ({ timeZoneReviewStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const stagingStatus = observable([ 'Approved', 'Rejected' ]);
  const agGrid = useAgGrid<AIRPORT_TIME_ZONE_FILTERS, StagingAirportTimezoneModel>([], gridState);
  const _timeZoneReviewStore = timeZoneReviewStore as TimeZoneReviewStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const _useConfirmDialog = useConfirmDialog();
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Airport Time Zone Review'), 'geographic');
    loadInitialData();
  }, []);

  const setHasSelectedRow = (): void => {
    gridState.setHasSelectedRows(!!gridState.gridApi.getSelectedRows().length);
  };

  /* istanbul ignore next */
  const approveRejectStagingAirportTimezones = (
    stagingAirportTimeZones: StagingAirportTimezoneModel[],
    action: APPROVE_REJECT_ACTIONS
  ): void => {
    const stagingAirportRegionIds: number[] = stagingAirportTimeZones.map(
      (airportTimezone: StagingAirportTimezoneModel) => Number(airportTimezone.id)
    );

    UIStore.setPageLoader(true);
    _timeZoneReviewStore
      .approveRejectStagingAirportTimezones(stagingAirportRegionIds, action)
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

  /* istanbul ignore next */
  const confirmChanges = (
    action: APPROVE_REJECT_ACTIONS,
    stagingAirportTimeZones: StagingAirportTimezoneModel[],
    isMulti?: boolean
  ): void => {
    if (!stagingAirportTimeZones?.length) return;
    const message: string = isMulti ? 'selected Airport Time Zones' : 'selected Airport Time Zone';
    _useConfirmDialog.confirmAction(
      () => {
        approveRejectStagingAirportTimezones(stagingAirportTimeZones, action), ModalStore.close();
      },
      {
        title: `Confirm ${action} ${message}`,
        message: `Are you sure you want to ${action} ${message}?`,
      }
    );
  };

  /* istanbul ignore next */
  const updateRegion = (rowIndex: number): void => {
    const data = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    const request = {
      airportId: data?.id,
      timezoneRegionId: data?.timeZoneRegion?.id,
    };
    UIStore.setPageLoader(true);
    _timeZoneReviewStore
      .updateStagingTimezoneRegion(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  const gridActions = (action: GRID_ACTIONS, rowIndex: number): void => {
    const stagingAirportTimeZones: StagingAirportTimezoneModel = gridState.gridApi?.getDisplayedRowAtIndex(rowIndex)
      ?.data;

    if (!stagingAirportTimeZones) {
      return;
    }
    switch (action) {
      case GRID_ACTIONS.APPROVE:
        confirmChanges(APPROVE_REJECT_ACTIONS.APPROVE, [ stagingAirportTimeZones ], false);
        break;
      case GRID_ACTIONS.REJECT:
        confirmChanges(APPROVE_REJECT_ACTIONS.REJECT, [ stagingAirportTimeZones ], false);
        break;
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, 'timeZoneRegion');
        break;
      case GRID_ACTIONS.CANCEL:
        agGrid.cancelEditing(rowIndex);
        break;
      case GRID_ACTIONS.SAVE:
        updateRegion(rowIndex);
        break;
    }
  };

  const generalFields = (): (ColDef | ColGroupDef)[] => {
    return [
      {
        headerName: 'GD',
        groupId: 'generalDetails',
        suppressMenu: true,
        editable: false,
        children: [
          {
            headerName: 'Staging Status',
            field: 'stagingStatusName',
            headerTooltip: 'Staging Status',
            minWidth: 90,
            headerComponent: 'customHeader',
            sortable: true,
            editable: false,
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
            editable: false,
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
            editable: false,
          },
        ],
      },
    ];
  };

  const columnDefs: ColDef[] = [
    {
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: ({ data }) => !stagingStatus.includes(data.stagingStatusName),
      maxWidth: 60,
      headerName: '',
      field: 'rowSelection',
      hide: !geographicModuleSecurity.isEditable,
      editable: false,
    },
    {
      headerName: 'Years',
      field: 'year',
      headerTooltip: 'Year',
      maxWidth: 100,
      minWidth: 100,
      editable: false,
    },
    {
      headerName: 'Airport Code',
      field: 'airportCode',
      headerTooltip: 'Airport Code',
      minWidth: 120,
      editable: false,
    },
    {
      headerName: 'Airport Name',
      field: 'name',
      headerTooltip: 'Airport Name',
      minWidth: 120,
      editable: false,
    },
    {
      headerName: 'Current Zone Name',
      field: 'currentZoneName',
      headerTooltip: 'Current Zone Name',
      minWidth: 120,
      editable: false,
    },
    {
      headerName: 'Current Zone Abbreviation',
      field: 'currentZoneAbbreviation',
      headerTooltip: 'Current Zone Abbreviation',
      minWidth: 80,
      editable: false,
    },
    {
      headerName: 'Current Offset',
      field: 'currentOffset',
      headerTooltip: 'Current Offset',
      minWidth: 90,
      editable: false,
    },
    {
      headerName: 'Region Name',
      field: 'timeZoneRegion',
      minWidth: 120,
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Region',
        getAutoCompleteOptions: () => _timeZoneReviewStore.timeZoneRegions,
        valueGetter: (option: SettingsTypeModel) => option,
      },
      headerTooltip: 'Region Name',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
    },
    ...generalFields(),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: '',
      cellRenderer: 'viewRenderer',
      minWidth: 160,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellEditor: 'actionRenderer',
      cellEditorParams: {
        isRowEditing: true,
        onAction: gridActions.bind(this),
      },
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) => (
          <GridReviewActions
            isDisabled={
              UIStore.pageLoading || gridState.hasSelectedRows || stagingStatus.includes(data.stagingStatusName)
            }
            isRowEditing={gridState.isRowEditing}
            showInfoButton={false}
            showEditButton={true}
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
      isEditable: geographicModuleSecurity.isEditable,
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      suppressClickEdit: true,
      onRowSelected: () => setHasSelectedRow(),
      onRowEditingStarted: p => {
        agGrid.onRowEditingStarted(p);
        _timeZoneReviewStore.loadTimeZoneRegion().subscribe();
        agGrid.setColumnVisible('rowSelection', false);
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('rowSelection', true);
      },
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const {
          currentZoneName,
          airportCode,
          currentZoneAbbreviation,
          stagingStatusName,
          timeZoneRegion,
        } = node.data as StagingAirportTimezoneModel;
        if (!searchHeader) {
          return false;
        }
        return agGrid.isFilterPass(
          {
            [AIRPORT_TIME_ZONE_FILTERS.CURRENT_ZONE_NAME]: currentZoneName,
            [AIRPORT_TIME_ZONE_FILTERS.AIRPORT_CODE]: airportCode,
            [AIRPORT_TIME_ZONE_FILTERS.CURRENT_ZONE_ABBREVIATION]: currentZoneAbbreviation,
            [AIRPORT_TIME_ZONE_FILTERS.REGION_NAME]: timeZoneRegion.name,
            [AIRPORT_TIME_ZONE_FILTERS.STAGING_STATUS]: stagingStatusName,
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
      .loadStagingAirportTimeZones()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const headerActions = (action: APPROVE_REJECT_ACTIONS): void => {
    const stagingAirportTimeZones: StagingAirportTimezoneModel[] = gridState.gridApi?.getSelectedRows();
    const isMultiple = stagingAirportTimeZones.length > 1 ? true : false;
    switch (action) {
      case APPROVE_REJECT_ACTIONS.APPROVE_SELECTED:
        confirmChanges(APPROVE_REJECT_ACTIONS.APPROVE, stagingAirportTimeZones, isMultiple);
        break;
      case APPROVE_REJECT_ACTIONS.REJECT_SELECTED:
        confirmChanges(APPROVE_REJECT_ACTIONS.REJECT, stagingAirportTimeZones, isMultiple);
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
          agGridUtilities.createSelectOption(AIRPORT_TIME_ZONE_FILTERS, AIRPORT_TIME_ZONE_FILTERS.AIRPORT_CODE),
        ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('timeZoneReviewStore', 'sidebarStore')(observer(AirportTimeZoneReview));
