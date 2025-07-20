import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import {
  HealthVendorModel,
  HealthVendorStore,
  HEALTH_VENDOR_FILTERS,
  updateRestrictionSidebarOptions,
  useRestrictionModuleSecurity,
} from '../Shared';
import { observer, inject } from 'mobx-react';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  ISelectOption,
  UIStore,
  Utilities,
  ViewPermission,
  SearchStore,
  IdNameCodeModel,
  SettingsTypeModel,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  CustomAgGridReact,
  IActionMenuItem,
  useGridState,
  useAgGrid,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router';

interface Props {
  healthVendorStore?: HealthVendorStore;
  sidebarStore?: typeof SidebarStore;
}

const HealthVendor: FC<Props> = ({ healthVendorStore, sidebarStore }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<HEALTH_VENDOR_FILTERS, HealthVendorModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const _healthVendorStore = healthVendorStore as HealthVendorStore;
  const location = useLocation();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(updateRestrictionSidebarOptions('Health Vendor'), 'restrictions');
    loadHealthVendors();
  }, []);

  /* istanbul ignore next */
  const loadHealthVendors = (): void => {
    UIStore.setPageLoader(true);
    _healthVendorStore
      .getHealthVendors(true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          gridState.data = response.results;
        },
      });
  };

  /* istanbul ignore next */
  const actionMenus = (): IActionMenuItem[] => {
    return [
      {
        title: 'Edit',
        action: GRID_ACTIONS.EDIT,
        isHidden: !restrictionModuleSecurity.isQRGAdmin,
        to: node => `/restrictions/health-vendor/${node?.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.DETAILS,
        to: node => `/restrictions/health-vendor/${node?.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      filter: true,
    },
    {
      headerName: 'Vendor Level',
      field: 'authorizationLevel',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.authorizationLevel.name,
    },
    {
      headerName: 'Vendor Level Entity',
      field: 'vendorLevelEntity',
      comparator: (current: IdNameCodeModel, next: IdNameCodeModel) =>
        Utilities.customComparator(current, next, 'label'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.vendorLevelEntity.label,
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: true,
      cellRenderer: 'statusRenderer',
      filterValueGetter: ({ data }: ValueGetterParams) => data.status?.label,
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => actionMenus(),
      },
    },
  ];

  /* istanbul ignore next */
  const gridActionProps = (): object => {
    return {
      tooltip: 'Health Vendor',
      getDisabledState: () => gridState.hasError,
    };
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: gridActionProps(),
    });

    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { name, id, vendorLevelEntity } = node.data as HealthVendorModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [HEALTH_VENDOR_FILTERS.NAME]: name,
              [HEALTH_VENDOR_FILTERS.VENDOR_LEVEL_ENTITY]: vendorLevelEntity.label,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={restrictionModuleSecurity.isQRGAdmin}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to="new"
          title="Add Health Vendor"
          disabled={gridState.isProcessing || UIStore.pageLoading}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(HEALTH_VENDOR_FILTERS, HEALTH_VENDOR_FILTERS.NAME) ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('healthVendorStore', 'sidebarStore')(observer(HealthVendor));
