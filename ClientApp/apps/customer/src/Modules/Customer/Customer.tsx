import React, { FC, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { ModelStatusOptions, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { AlertStore } from '@uvgo-shared/alert';
import {
  GRID_ACTIONS,
  UIStore,
  AccessLevelModel,
  Utilities,
  ISelectOption,
  SourceTypeModel,
  GridPagination,
  IAPIGridRequest,
} from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  CUSTOMER_FILTER,
  SettingsStore,
  customerSidebarOptions,
  CustomerStore,
  CustomerModel,
  CUSTOMER_FILTER_BY,
  useCustomerModuleSecurity,
} from '../Shared';
import { gridFilters } from './fields';
import { SidebarStore } from '@wings-shared/layout';

interface Props {
  customerStore?: CustomerStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Customer: FC<Props> = ({ customerStore, settingsStore, sidebarStore }: Props) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<CUSTOMER_FILTER, CustomerModel>(gridFilters, gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(customerSidebarOptions(true), 'customer');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const upsertCustomer = (rowIndex): void => {
    const data: CustomerModel = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _customerStore
      .upsertCustomer(data)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: (response: CustomerModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
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
        upsertCustomer(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Number',
      field: 'number',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('number', 1),
    },
    {
      headerName: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 1),
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,50',
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 1),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('accessLevel', 1),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('sourceType', 1),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Source Type',
        getAutoCompleteOptions: () => _settingsStore.sourceTypes,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          onAction: (action: GRID_ACTIONS) => {
            if ([ GRID_ACTIONS.EDIT, GRID_ACTIONS.DETAILS ].includes(action)) {
              searchHeader.saveSearchFilters(gridState);
            }
          },
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
              action: GRID_ACTIONS.EDIT,
              to: node => `upsert/${node.data.number}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
              to: node => `upsert/${node.data.number}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        loadSettingsData();
      },
      onFilterChanged: () => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs()
          return
        }
        loadInitialData()
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  /* istanbul ignore next */
  const getFilterCollection = (): IAPIGridRequest => {
    if (!searchHeader.getFilters()?.searchValue) {
      return {};
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, 
        searchHeader.getFilters().selectInputsValues.get('defaultOption'))
    );
    return {
      searchCollection: JSON.stringify([
        { propertyName: property?.apiPropertyName, propertyValue: searchHeader.getFilters().searchValue },
      ]),
    };
  };

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...getFilterCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getCustomersNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  /* istanbul ignore next */
  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getSourceTypes(), _settingsStore.getAccessLevels() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(CUSTOMER_FILTER_BY, CUSTOMER_FILTER_BY.NUMBER),
        ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
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

export default inject('customerStore', 'settingsStore', 'sidebarStore')(observer(Customer));
