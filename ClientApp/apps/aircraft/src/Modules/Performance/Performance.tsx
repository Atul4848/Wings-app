import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  DATE_FORMAT,
  Utilities,
  UIStore,
  AccessLevelModel,
  SourceTypeModel,
  ISelectOption,
  IAPIGridRequest,
  ViewPermission,
  SearchStore,
  SettingsTypeModel,
  GRID_ACTIONS,
  GridPagination,
} from '@wings-shared/core';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import {
  AircraftVariationStore,
  CustomResponseDialog,
  PerformanceModel,
  PerformanceStore,
  SettingsStore,
  PERFORMANCE_FILTERS,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../Shared';
import { observer, inject } from 'mobx-react';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { useStyles } from './Performance.styles';
import { of } from 'rxjs';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { performanceGridFilters } from './fields';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  settingsStore?: SettingsStore;
  performanceStore?: PerformanceStore;
  aircraftVariationStore?: AircraftVariationStore;
  sidebarStore?: typeof SidebarStore;
}
const Performance: FC<Props> = ({ settingsStore, performanceStore, aircraftVariationStore, sidebarStore }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<PERFORMANCE_FILTERS, PerformanceModel>(performanceGridFilters, gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const _performanceStore = performanceStore as PerformanceStore;
  const _aircraftVariationStore = aircraftVariationStore as AircraftVariationStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore.setNavLinks(updateAircraftSidebarOptions('Performance'), 'aircraft');
    loadInitialData();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    UIStore.setPageLoader(true);
    _performanceStore
      .getPerformances(true, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(performances => {
        gridState.setGridData(performances.results);
        gridState.setPagination(new GridPagination({ ...performances }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 250,
      headerTooltip: 'Name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 2),
    },
    {
      headerName: 'Max Flight Level',
      field: 'maxFlightLevel',
      headerTooltip: 'Max Flight Level',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('maxFlightLevel', 2),
    },
    {
      headerName: 'Default Cruise Schedule',
      field: 'defaultCruiseSchedule',
      headerTooltip: 'Default Cruise Schedule',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filterValueGetter: ({ data }: ValueGetterParams) => data.defaultCruiseSchedule.name,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('defaultCruiseSchedule', 2),
    },
    {
      headerName: 'Max Performance Weight(Pounds)',
      field: 'mtowInPounds',
      headerTooltip: 'Max Performance Weight(Pounds)',
    },
    {
      headerName: 'Max Performance Weight(Kilos)',
      field: 'mtowInKilos',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('mtowInKilos', 2),
      headerTooltip: 'Max Performance Weight(Kilos)',
    },
    {
      headerName: 'Performance Details',
      groupId: 'performanceDetails',
      children: [
        {
          headerName: 'Modified Date',
          groupId: 'modifiedOn',
          headerComponent: 'customHeader',
          minWidth: 150,
          field: 'modifiedOn',
          cellEditor: 'customTimeEditor',
          headerTooltip: 'Modified Date',
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
        },
        {
          headerName: 'Default Descent Schedule',
          field: 'defaultDescentSchedule',
          columnGroupShow: 'open',
          headerTooltip: 'Default Descent Schedule',
          comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
            Utilities.customComparator(current, next, 'name'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('defaultDescentSchedule', 2),
          filterValueGetter: ({ data }: ValueGetterParams) => data.defaultDescentSchedule.name,
        },
        {
          headerName: 'Default Climb Schedule',
          field: 'defaultClimbSchedule',
          columnGroupShow: 'open',
          comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
            Utilities.customComparator(current, next, 'name'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('defaultClimbSchedule', 2),
          filterValueGetter: ({ data }: ValueGetterParams) => data.defaultClimbSchedule.name,
          headerTooltip: 'Default Climb Schedule',
        },
        {
          headerName: 'Default Hold Schedule',
          field: 'defaultHoldSchedule',
          columnGroupShow: 'open',
          headerTooltip: 'Default Hold Schedule',
          comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
            Utilities.customComparator(current, next, 'name'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('defaultHoldSchedule', 2),
          filterValueGetter: ({ data }: ValueGetterParams) => data.defaultHoldSchedule.name,
        },
        {
          headerName: 'Created Date',
          field: 'createdOn',
          columnGroupShow: 'open',
          cellEditor: 'customTimeEditor',
          headerTooltip: 'Created Date',
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
        },
        {
          headerName: 'Access Level',
          columnGroupShow: 'open',
          field: 'accessLevel',
          cellEditor: 'customAutoComplete',
          headerTooltip: 'Access Level',
          comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
            Utilities.customComparator(current, next, 'name'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filterValueGetter: ({ data }: ValueGetterParams) => data.accessLevel.name,
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('accessLevel', 2),
        },
        {
          headerName: 'Source',
          columnGroupShow: 'open',
          field: 'sourceType',
          cellEditor: 'customAutoComplete',
          headerTooltip: 'Source',
          comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
            Utilities.customComparator(current, next, 'name'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filterValueGetter: ({ data }: ValueGetterParams) => data.sourceType.name,
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('sourceType', 2),
        },
        {
          headerName: 'Status',
          field: 'status',
          columnGroupShow: 'open',
          cellEditor: 'customAutoComplete',
          cellRenderer: 'statusRenderer',
          headerTooltip: 'Status',
          comparator: (current: ISelectOption, next: ISelectOption) =>
            Utilities.customComparator(current, next, 'value'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filterValueGetter: ({ data }: ValueGetterParams) => data.status.name,
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2, 'start'),
        },
      ],
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !aircraftModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
              to: node => `/aircraft/performance/${node?.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
            },
            {
              title: 'Details',
              isHidden: false,
              action: GRID_ACTIONS.DETAILS,
              to: node => `/aircraft/performance/${node?.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
            },
            {
              title: 'Delete',
              isHidden: !aircraftModuleSecurity.isEditable,
              action: GRID_ACTIONS.DELETE,
            },
          ],
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            const model: PerformanceModel = agGrid._getTableItem(rowIndex);
            if (Utilities.isEqual(action, GRID_ACTIONS.DELETE)) {
              confirmDeleteAction(model);
            }
          },
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const getAircraftVariationByPerformanceId = (model: PerformanceModel): void => {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        { propertyName: 'AircraftVariationPerformances.Performance.PerformanceId', propertyValue: model.id },
      ]),
    };
    _aircraftVariationStore
      .getAircraftVariationById(request)
      .pipe(
        switchMap(response => {
          if (response?.id) {
            showAlertInformation();
            return of('');
          }
          return _performanceStore.deletePerformanceRecord(model.id);
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response) {
            agGrid._removeTableItems([ model ]);
            gridState.setGridData(gridState.data.filter(({ id }) => model.id !== id));
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const confirmDeleteAction = (model: PerformanceModel): void => {
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        getAircraftVariationByPerformanceId(model);
      },
      {
        title: 'Confirm Delete',
        isDelete: true,
      }
    );
  };

  const showAlertInformation = (): void => {
    ModalStore.open(
      <CustomResponseDialog
        heading="Alert!"
        message="Performance record cannot be deleted as it is associated with an AircraftVariation."
        classes={{ modalWidth: classes?.modalWidth }}
      />
    );
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'Performance',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      suppressClickEdit: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadInitialData();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to={`performance/${VIEW_MODE.NEW.toLowerCase()}`}
          title="Add Performance"
          disabled={gridState.isRowEditing || UIStore.pageLoading}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(PERFORMANCE_FILTERS, PERFORMANCE_FILTERS.NAME) ]}
        rightContent={rightContent}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={request => loadInitialData(request)}
      />
    </>
  );
};

export default inject(
  'performanceStore',
  'settingsStore',
  'aircraftVariationStore',
  'sidebarStore'
)(observer(Performance));
