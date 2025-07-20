import React, { FC, ReactNode, useEffect } from 'react';
import { GridOptions, ColDef, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import { EventStore, EVENT_FILTERS, EventModel, TIMEZONE_AUDIT_MODULES, updateTimezoneSidebarOptions } from '../Shared';
import { useStyles } from './EventModule.styles';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  cellStyle,
  ViewPermission,
  IAPIGridRequest,
  GridPagination,
  SearchStore,
  DATE_FORMAT,
  ISelectOption,
  IAPIPageResponse,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { AuditHistory, VIEW_MODE, baseApiPath } from '@wings/shared';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { eventGridFilters } from './fields';

interface Props {
  eventStore?: EventStore;
  sidebarStore?: typeof SidebarStore;
}

const EventModule: FC<Props> = ({ eventStore, sidebarStore }: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<EVENT_FILTERS, EventModel>(eventGridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _eventStore = eventStore as EventStore;
  const _useConfirmDialog = useConfirmDialog();
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('World Events'), 'geographic');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadEvents());
    loadEvents();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadEvents());
  }, []);

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    if (searchHeader.getFilters().searchValue) {
      searchHeader.saveSearchFilters(gridState);
    }
    switch (gridAction) {
      case GRID_ACTIONS.DELETE:
        confirmRemoveEvent(rowIndex);
        break;
      case GRID_ACTIONS.AUDIT:
        const model: EventModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.name}
            entityId={model.id}
            entityType={TIMEZONE_AUDIT_MODULES.WORLD_EVENT}
            baseUrl={baseApiPath.timezones}
          />
        );
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 2),
    },
    {
      headerName: 'Description',
      field: 'description',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('description', 2),
    },
    {
      headerName: 'Category',
      field: 'eventCategory',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('eventCategory', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
    },
    {
      headerName: 'Type',
      field: 'eventType',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('eventType', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
    },
    {
      headerName: 'Country',
      field: 'country',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('country', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Cities',
      field: 'cities',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('cities', 2),
    },
    {
      headerName: 'Region',
      field: 'region',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('region', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Airports',
      field: 'airports',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('airports', 2),
    },
    {
      headerName: 'Start Date',
      field: 'eventSchedule.startDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'End Date',
      field: 'eventSchedule.endDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'UA Office',
      field: 'uaOffice',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('uaOffice', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: 'agTextColumnFilter',
      cellRenderer: 'statusRenderer',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2),
      filterValueGetter: ({ data }: ValueGetterParams) => data.status?.label,
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: '',
      maxWidth: 120,
      minWidth: 120,
      suppressAutoSize: true,
      suppressMenu: true,
      suppressMovable: true,
      editable: false,
      cellRenderer: 'actionRenderer',
      suppressSizeToFit: true,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: geographicModuleSecurity.isEditable,
      gridActionProps: {
        isActionMenu: true,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        actionMenus: () => [
          {
            title: 'Edit',
            isHidden: !geographicModuleSecurity.isEventEditable,
            action: GRID_ACTIONS.EDIT,
            to: node => `${node.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Details',
            action: GRID_ACTIONS.VIEW,
            to: node => `${node.data.id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
          },
          {
            title: 'Delete',
            isHidden: !geographicModuleSecurity.isEventEditable,
            action: GRID_ACTIONS.DELETE,
          },
          { title: 'Audit', action: GRID_ACTIONS.AUDIT },
        ],
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadEvents();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadEvents({ pageNumber: 1 });
      },
    };
  };

  /* istanbul ignore next */
  const getFilterCollection = (): IAPIGridRequest => {
    if (!searchHeader.getFilters().searchValue) {
      return {};
    }
    const property = eventGridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, searchHeader.getFilters().selectInputsValues.get('defaultOption'))
    );
    return {
      searchCollection: JSON.stringify([
        { propertyName: property?.apiPropertyName, propertyValue: searchHeader.getFilters().searchValue },
      ]),
    };
  };

  /* istanbul ignore next */
  const loadEvents = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...getFilterCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    if (
      searchHeader.getFilters().searchValue &&
      searchHeader.getFilters().selectInputsValues.get('defaultOption') === EVENT_FILTERS.ALL &&
      !Boolean(Array.from(gridState.columFilters).length)
    ) {
      const searchCollection = eventGridFilters.map((x, index) => {
        const operator = Boolean(index) ? { operator: 'or' } : null;
        return { propertyName: x.apiPropertyName, propertyValue: searchHeader.getFilters().searchValue, ...operator };
      });
      request.searchCollection = JSON.stringify(searchCollection);
    }

    UIStore.setPageLoader(true);
    _eventStore
      ?.getEvents(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  /* istanbul ignore next */
  const removeEvent = (rowIndex: number): void => {
    ModalStore.close();
    const model: EventModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);

    _eventStore
      ?.removeEvent(model.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(() => agGrid._removeTableItems([ model ]));
  };

  /* istanbul ignore next */
  const confirmRemoveEvent = (rowIndex: number): void => {
    const model: EventModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      agGrid._removeTableItems([ model ]);
      return;
    }
    _useConfirmDialog.confirmAction(
      () => {
        removeEvent(rowIndex), ModalStore.close();
      },
      {
        isDelete: true,
      }
    );
  };

  /* istanbul ignore next */
  const exportEventExcel = (): void => {
    UIStore.setPageLoader(true);
    _eventStore
      ?.getEventExcelFile()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((file: File) => {
        const url = window.URL.createObjectURL(new Blob([ file ]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'WorldEvent.xlsx');

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });
  };

  // right content for search header
  const rightContent = (): ReactNode => {
    return (
      <>
        <PrimaryButton variant="contained" disabled={UIStore.pageLoading} onClick={() => exportEventExcel()}>
          Export Excel
        </PrimaryButton>
        <ViewPermission hasPermission={geographicModuleSecurity.isEventEditable}>
          <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Event" />
        </ViewPermission>
      </>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(EVENT_FILTERS, EVENT_FILTERS.ALL, 'defaultOption') ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onFiltersChanged={loadEvents}
        onSearch={sv => loadEvents()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadEvents}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('eventStore', 'sidebarStore')(observer(EventModule));
