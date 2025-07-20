import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import {
  customerSidebarOptions,
  useCustomerModuleSecurity,
  SettingsStore,
  EXTERNAL_CUSTOMER_MAPPING,
  ExternalCustomerMappingModel,
} from '../Shared';
import { gridFilters } from './fields';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ViewPermission, GRID_ACTIONS, UIStore, GridPagination, IAPIGridRequest, Utilities } from '@wings-shared/core';
import { useParams } from 'react-router';
import { CustomerMappingsStore } from '../Shared/Stores/CustomerMappings.store';

interface Props {
  settingsStore?: SettingsStore;
  customerMappingsStore?: CustomerMappingsStore;
  sidebarStore?: typeof SidebarStore;
  // required to fetch the customer details
  customerPartyId?: number;
  isDisabled?: boolean;
}

const ExternalCustomerMappings: FC<Props> = ({ isDisabled = false, customerPartyId, ...props }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const params = useParams();
  const agGrid = useAgGrid<EXTERNAL_CUSTOMER_MAPPING, ExternalCustomerMappingModel>(gridFilters, gridState);
  const _settingsStore = props.settingsStore as SettingsStore;
  const _customerMappingsStore = props.customerMappingsStore as CustomerMappingsStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const { isEditable } = useCustomerModuleSecurity();
  // if user contain customer number then we are in the cutomser spericifc screen to no need to load the sidebars
  const isCustomerSpecificCustomer = Boolean(params.customerNumber);
  const showEditOption = useMemo(() => isEditable && !isDisabled, [ isEditable, isDisabled ]);

  // Load Data on Mount
  useEffect(() => {
    if (!isCustomerSpecificCustomer) {
      _sidebarStore.setNavLinks(customerSidebarOptions(true), 'customer');
    }
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
      ...pageRequest,
      ...(customerPartyId
        ? {
          filterCollection: JSON.stringify([ Utilities.getFilter('Customer.PartyId', customerPartyId) ]),
        }
        : {}),
    };
    UIStore.setPageLoader(true);
    _customerMappingsStore
      .getExternalCustomerMappings(request)
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
  const columnDefs: ColDef[] = [
    {
      headerName: 'Mapping Level',
      field: 'externalCustomerMappingLevel',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('externalCustomerMappingLevel', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'Customer',
      field: 'customer',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('customer', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'Associated Registries',
      field: 'customerAssociatedRegistries',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('customerAssociatedRegistries', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'Associated Offices',
      field: 'customerAssociatedOffices',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('customerAssociatedOffices', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'Associated Operators',
      field: 'customerAssociatedOperators',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('customerAssociatedOperators', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'External Account',
      field: 'externalCustomerSource',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('externalCustomerSource', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    ...agGrid.generalFields(_settingsStore),
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
              isHidden: !showEditOption,
              action: GRID_ACTIONS.EDIT,
              to: node => `${node.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
              to: node => `${node.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });
    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => {
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

  const rightContent = (): ReactNode => (
    <ViewPermission hasPermission={isEditable}>
      <CustomLinkButton
        variant="contained"
        startIcon={<AddIcon />}
        to="new"
        title="Add External Customer Mapping"
        disabled={isDisabled}
      />
    </ViewPermission>
  );
  const selectInputs = agGridUtilities.createSelectOption(EXTERNAL_CUSTOMER_MAPPING, EXTERNAL_CUSTOMER_MAPPING.LEVEL);
  if (customerPartyId) {
    selectInputs.selectOptions = selectInputs.selectOptions.filter(x => x.value !== EXTERNAL_CUSTOMER_MAPPING.CUSTOMER);
  }

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ selectInputs ]}
        onResetFilterClick={() => agGrid.filtersApi.resetColumnFilters()}
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
        key={`externalMappings-${isDisabled}`}
      />
    </>
  );
};

export default inject('settingsStore', 'customerMappingsStore', 'sidebarStore')(observer(ExternalCustomerMappings));
