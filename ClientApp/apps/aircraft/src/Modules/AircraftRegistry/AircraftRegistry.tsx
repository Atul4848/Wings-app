import React, { FC, ReactNode, useEffect } from 'react';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { DATE_FORMAT, Utilities, UIStore, GRID_ACTIONS, ViewPermission } from '@wings-shared/core';
import { ColDef, GridOptions, ValueGetterParams, ValueFormatterParams } from 'ag-grid-community';
import {
  AIRCRAFT_REGISTRY_FILTERS,
  AircraftRegistryStore,
  AircraftRegistryModel,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../Shared';
import { observer, inject } from 'mobx-react';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  aircraftRegistryStore?: AircraftRegistryStore;
  sidebarStore?: typeof SidebarStore;
}

const AircraftRegistry: FC<Props> = ({ aircraftRegistryStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRCRAFT_REGISTRY_FILTERS, AircraftRegistryModel>([], gridState);
  const searchHeader = useSearchHeader();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => {
    sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Aircraft Registry'), 'aircraft');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    aircraftRegistryStore
      ?.getAircraftRegistries()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(aircraftVariations => gridState.setGridData(aircraftVariations));
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Registry',
      field: 'registry',
      filter: true,
      headerTooltip: 'Registry',
    },
    {
      headerName: 'Registry Nationality',
      field: 'registryNationality',
      filter: true,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      headerTooltip: 'Registry Nationality',
    },
    {
      headerName: 'Registry Start Date',
      field: 'registryStartDate',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.receivedDate, DATE_FORMAT.DATE_PICKER_FORMAT),
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      headerTooltip: 'Registry Start Date',
    },
    {
      headerName: 'Registry End Date',
      field: 'registryEndDate',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.receivedDate, DATE_FORMAT.DATE_PICKER_FORMAT),
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      headerTooltip: 'Registry End Date',
    },
    {
      headerName: 'ACAS',
      field: 'acas',
      filter: true,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      headerTooltip: 'ACAS',
    },
    {
      headerName: 'Airframe',
      field: 'airframe',
      filter: true,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      headerTooltip: 'Airframe',
    },
    {
      headerName: 'Oceanic Clearance Enabled',
      field: 'isOceanicClearanceEnabled',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      filter: true,
      headerTooltip: 'Oceanic Clearance Enabled',
    },
    {
      headerName: 'PDC Registered',
      field: 'isPDCRegistered',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      filter: true,
      headerTooltip: 'PDC Registered',
    },
    ...agGrid.auditFields(gridState.isRowEditing),
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
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
            },
          ],
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'Aircraft Registry',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, registry } = node.data as AircraftRegistryModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRCRAFT_REGISTRY_FILTERS.REGISTRY]: registry,
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
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to="new"
          title="Add Aircraft Registry"
          disabled={gridState.isRowEditing || UIStore.pageLoading}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(AIRCRAFT_REGISTRY_FILTERS, AIRCRAFT_REGISTRY_FILTERS.REGISTRY),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        onExpandCollapse={agGrid.autoSizeColumns}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('aircraftRegistryStore', 'sidebarStore')(observer(AircraftRegistry));
