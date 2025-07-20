import React, { FC, useEffect, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { UIStore, GridPagination, IAPIGridRequest, ViewPermission } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  SettingsStore,
  customerSidebarOptions,
  CustomerStore,
  CUSTOMER_CONTACT_FILTERS,
  CustomerContactModel,
  useCustomerModuleSecurity,
} from '../Shared';
import { gridFilters } from './fields';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import ContactDetailsGrid from './ContactDetailsGrid/ContactDetailsGrid';

interface Props {
  customerStore?: CustomerStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Contacts: FC<Props> = ({ customerStore, settingsStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<CUSTOMER_CONTACT_FILTERS, CustomerContactModel>(gridFilters, gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(customerSidebarOptions(true), 'customer');
    loadInitialData();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const _searchValue = searchHeader.getFilters().searchValue || '';
    const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      specifiedFields: [
        'ContactId',
        'ContactValue',
        'ContactExtension',
        'ContactName',
        'ContactMethod',
        'ContactType',
        'Status',
        'SourceType',
        'AccessLevel',
        'ModifiedOn',
        'ModifiedBy',
        'CreatedOn',
        'CreatedBy',
      ],
      ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getContactsNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
        _customerStore.contacts = response.results;
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact',
      field: 'contact',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contact', 1),
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'Contact Extension',
      field: 'contactExtension',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactExtension', 1),
    },
    {
      headerName: 'Contact Name',
      field: 'contactName',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactName', 1),
    },
    {
      headerName: 'Contact Method',
      field: 'contactMethod',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactMethod', 1),
      valueFormatter: ({ value }) => value?.name || '',
    },
    {
      headerName: 'Contact Type',
      field: 'contactType',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactType', 1),
      valueFormatter: ({ value }) => value?.name || '',
    },
    ...agGrid.generalFields(_settingsStore),
    ...agGrid.auditFields(gridState.isRowEditing),
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });
    return {
      ...baseOptions,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      detailCellRenderer: 'customDetailCellRenderer',
      detailCellRendererParams: {
        isEditable: customerModuleSecurity.isEditable,
        customerStore: _customerStore,
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customDetailCellRenderer: ContactDetailsGrid,
      },
      onFilterChanged: () => Array.from(gridState.columFilters).length === 0 && loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
      },
    };
  };

  const rightContent = (): ReactNode => (
    <ViewPermission hasPermission={customerModuleSecurity.isEditable}>
      <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Contact" />
    </ViewPermission>
  );

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        // eslint-disable-next-line max-len
        selectInputs={[ agGridUtilities.createSelectOption(CUSTOMER_CONTACT_FILTERS, CUSTOMER_CONTACT_FILTERS.CONTACT) ]}
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
      />
    </>
  );
};

export default inject('customerStore', 'settingsStore', 'sidebarStore')(observer(Contacts));
