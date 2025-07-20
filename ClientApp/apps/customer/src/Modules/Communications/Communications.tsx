import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IClasses,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import {
  AgGridPopoverWrapper,
  CustomAgGridReact,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { VIEW_MODE } from '@wings/shared';
import { ColDef, GridOptions, ICellRendererParams, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  CUSTOMER_COMMUNICATION_FILTERS,
  ContactCommunicationFlatViewModel,
  CustomerStore,
  SettingsStore,
  customerSidebarOptions,
  useCustomerModuleSecurity,
} from '../Shared';
import Chip from '@material-ui/core/Chip';
import { gridFilters } from './fields';

interface Props extends Partial<ICellRendererParams> {
  customerStore?: CustomerStore;
  sidebarStore?: typeof SidebarStore;
  settingsStore?: SettingsStore;
}

const Communications: FC<Props> = ({ customerStore, sidebarStore, settingsStore }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<CUSTOMER_COMMUNICATION_FILTERS, ContactCommunicationFlatViewModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _customerStore = customerStore as CustomerStore;
  const _settingsStore = settingsStore as SettingsStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
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
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getCommunicationsNoSql(request)
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

  const viewRenderer = (chipValues, fieldKey) => {
    if (!Array.isArray(chipValues)) {
      return;
    }
    return (
      <AgGridPopoverWrapper chipsValues={chipValues} suppressPopover={!chipValues.length}>
        <>
          {chipValues.map((x, index) => {
            let _label;
            switch (fieldKey) {
              case 'sites':
                _label = x.customerAssociatedSite?.name;
                break;
              default:
                _label = x?.name;
                break;
            }
            return <Chip size="small" label={_label} key={index} />;
          })}
        </>
      </AgGridPopoverWrapper>
    );
  };

  const actionMenus = (node: RowNode) => {
    const communicationId = node.data?.contactCommunicationId;
    const contactId = node.data.contactId;
    return [
      {
        title: 'Edit',
        isHidden: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
        action: GRID_ACTIONS.EDIT,
        to: () => `${communicationId}/contact/${contactId}/${VIEW_MODE.EDIT.toLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.DETAILS,
        to: () => `${communicationId}/contact/${contactId}/${VIEW_MODE.DETAILS.toLowerCase()}`,
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Communication Level',
      field: 'communicationLevel',
      headerTooltip: 'Communication Level',
      valueFormatter: ({ value }) => value?.name || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('communicationLevel', 1),
    },
    {
      headerName: 'Contact Role',
      field: 'contactRole',
      headerTooltip: 'Contact Role',
      valueFormatter: ({ value }) => value?.name || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactRole', 1),
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      headerTooltip: 'Start Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      headerTooltip: 'End Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'Communication Categories',
      field: 'communicationCategories',
      headerTooltip: 'Communication Categories',
      cellRenderer: 'viewRenderer',
      sortable: false,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.communicationCategories, colDef?.field),
      },
    },
    {
      headerName: 'Customer',
      field: 'customer',
      headerTooltip: 'Customer',
      valueFormatter: ({ value }) => value?.name || '',
    },
    {
      headerName: 'Customer Number',
      field: 'customer',
      headerTooltip: 'Customer Number',
      valueFormatter: ({ value }) => value?.code || '',
      sortable: false,
    },
    {
      headerName: 'Offices',
      field: 'offices',
      headerTooltip: 'Offices',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.offices, colDef?.field),
      },
    },
    {
      headerName: 'Sequence',
      field: 'sequence',
      headerTooltip: 'Sequence',
    },
    {
      headerName: 'Sites',
      field: 'sites',
      headerTooltip: 'Sites',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.sites, colDef?.field),
      },
    },
    {
      headerName: 'Priority',
      field: 'contactPriority',
      headerTooltip: 'Priority',
      valueFormatter: ({ value }) => value?.name || '',
    },
    {
      headerName: 'Operators',
      field: 'operators',
      headerTooltip: 'Operators',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.operators, colDef?.field),
      },
    },
    {
      headerName: 'Registries',
      field: 'registries',
      headerTooltip: 'Registries',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses, colDef?: ColDef) =>
          viewRenderer(node.data?.registries, colDef?.field),
      },
    },
    {
      headerName: 'Contact',
      field: 'contact',
      headerTooltip: 'Contact',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contact', 1),
    },
    {
      headerName: 'Contact Extension',
      field: 'contactExtension',
      headerTooltip: 'Contact Extension',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactExtension', 1),
    },
    {
      headerName: 'Contact Name',
      field: 'contactName',
      headerTooltip: 'Contact Name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactName', 1),
    },
    {
      headerName: 'Contact Method',
      field: 'contactMethod',
      headerTooltip: 'Contact Method',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactMethod', 1),
      valueFormatter: ({ value }) => value?.name || '',
    },
    {
      headerName: 'Contact Type',
      field: 'contactType',
      headerTooltip: 'Contact Type',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactType', 1),
      valueFormatter: ({ value }) => value?.name || '',
    },
    ...agGrid.generalFields(_settingsStore),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus,
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
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
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

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Communication" />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        // eslint-disable-next-line max-len
        selectInputs={[
          agGridUtilities.createSelectOption(
            CUSTOMER_COMMUNICATION_FILTERS,
            CUSTOMER_COMMUNICATION_FILTERS.COMMUNICATION_LEVEL
          ),
        ]}
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

export default inject('customerStore', 'settingsStore', 'sidebarStore')(observer(Communications));
