import React, { FC, ReactNode, useEffect } from 'react';
import { GridOptions, ColDef, ValueFormatterParams } from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import {
  updateTimezoneSidebarOptions,
  SupplierModel,
  SUPPLIER_FILTERS,
  TimeZoneStore,
  TimeZoneSettingsStore,
} from '../Shared';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  GRID_ACTIONS,
  ViewPermission,
  IAPIGridRequest,
  GridPagination,
  IAPIPageResponse,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { VIEW_MODE } from '@wings/shared';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { gridFilters } from './fields';

interface Props {
  timeZoneStore?: TimeZoneStore;
  sidebarStore?: typeof SidebarStore;
  settingsStore?: TimeZoneSettingsStore;
}

const Suppliers: FC<Props> = ({ timeZoneStore, sidebarStore, settingsStore }: Props) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<SUPPLIER_FILTERS, SupplierModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const geographicModuleSecurity = useGeographicModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Suppliers'), 'geographic');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadSuppliers());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadSuppliers());
  }, []);

  /* istanbul ignore next */
  const loadSuppliers = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _timeZoneStore
      ?.getSuppliers(request)
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
  const columnDefs: ColDef[] = [
    {
      headerName: 'Supplier Type',
      field: 'supplierType',
      headerTooltip: 'Supplier Type',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('supplierType', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Supplier Name',
      field: 'name',
      headerTooltip: 'Supplier Name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 2),
    },
    {
      headerName: 'Email Address',
      field: 'emailAddress',
      headerTooltip: 'Email Address',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('emailAddress', 2),
    },
    {
      headerName: 'Service Level',
      field: 'serviceLevel',
      headerTooltip: 'Service Level',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('serviceLevel', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    ...agGrid.generalFields(settingsStore),
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: node => {
            return [
              {
                title: 'Edit',
                action: GRID_ACTIONS.EDIT,
                isHidden: !geographicModuleSecurity.isEditable,
                to: () => `${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
              },
              {
                title: 'Details',
                action: GRID_ACTIONS.DETAILS,
                to: () => `${node.data?.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
              },
            ];
          },
          onAction: (action: GRID_ACTIONS) => {
            if ([ GRID_ACTIONS.EDIT, GRID_ACTIONS.DETAILS ].includes(action)) {
              searchHeader.saveSearchFilters(gridState);
            }
          },
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: geographicModuleSecurity.isEditable,
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
        loadSuppliers();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadSuppliers({ pageNumber: 1 });
      },
    };
  };

  // right content for search header
  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={geographicModuleSecurity.isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Supplier" />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(SUPPLIER_FILTERS, SUPPLIER_FILTERS.TYPE) ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onFiltersChanged={loadSuppliers}
        onSearch={sv => loadSuppliers()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadSuppliers}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('timeZoneStore', 'sidebarStore')(observer(Suppliers));
