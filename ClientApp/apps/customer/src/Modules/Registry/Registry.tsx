import React, { FC, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { ModelStatusOptions, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  ViewPermission,
  GRID_ACTIONS,
  UIStore,
  AccessLevelModel,
  Utilities,
  ISelectOption,
  SourceTypeModel,
  GridPagination,
  IAPIGridRequest,
  SearchStore,
} from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  REGISTRY_FILTER,
  RegistryModel,
  RegistryStore,
  customerSidebarOptions,
  REGISTRY_FILTER_BY,
  useCustomerModuleSecurity,
} from '../Shared';
import { gridFilters } from './fields';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';

interface Props {
  registryStore?: RegistryStore;
  sidebarStore?: typeof SidebarStore;
}

const Registry: FC<Props> = ({ registryStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const location = useLocation();
  const agGrid = useAgGrid<REGISTRY_FILTER, RegistryModel>(gridFilters, gridState);
  const _registryStore = registryStore as RegistryStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    _sidebarStore.setNavLinks(customerSidebarOptions(true), 'customer');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 1),
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,20',
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
        getAutoCompleteOptions: () => [],
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
        getAutoCompleteOptions: () => [],
        valueGetter: (option: ISelectOption) => option,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            if (action === GRID_ACTIONS.DETAILS || action === GRID_ACTIONS.EDIT) {
              searchHeader.saveSearchFilters(gridState);
            }
          },
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
              action: GRID_ACTIONS.EDIT,
              to: node => `${node.data.id}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
              to: node => `${node.data.id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
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
      isEditable: true,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressClickEdit: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => agGrid.onRowEditingStarted(params),
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
        { propertyName: property?.apiPropertyName, propertyValue: searchHeader.getFilters()?.searchValue },
      ]),
    };
  };

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
    _registryStore
      .getRegistriesNoSql(request)
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

  const rightContent = (): ReactNode => (
    <ViewPermission hasPermission={customerModuleSecurity.isEditable}>
      <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Registry" />
    </ViewPermission>
  );

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(REGISTRY_FILTER_BY, REGISTRY_FILTER_BY.NAME) ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
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

export default inject('registryStore', 'sidebarStore')(observer(Registry));
