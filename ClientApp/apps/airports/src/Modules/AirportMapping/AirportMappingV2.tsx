import React, { FC, ReactNode, useEffect } from 'react';
import { GridOptions, ColDef, ValueFormatterParams } from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  IAPIGridRequest,
  GridPagination,
  IAPIPageResponse,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import {
  AIRPORT_MAPPING_FILTERS,
  AirportMappingStore,
  AirportMappingsModel,
  airportSidebarOptions,
  useAirportModuleSecurity
} from '../Shared';
import { VIEW_MODE } from '@wings/shared';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import UpsertAirportMapping from './Components/UpsertAirportMappingV2';
import { gridFilters } from './fields';

interface Props {
  airportMappingsStore?: AirportMappingStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportMapping: FC<Props> = ({ airportMappingsStore, sidebarStore }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_MAPPING_FILTERS, AirportMappingsModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _airportMappingsStore = airportMappingsStore as AirportMappingStore;
  const _useConfirmDialog = useConfirmDialog();
  const searchHeader = useSearchHeader();
  const airportModuleSecurity = useAirportModuleSecurity();
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    loadAirportMapping();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadAirportMapping());
  }, []);

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    const mapping: AirportMappingsModel = agGrid._getTableItem(rowIndex);
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        openUpsertDialog(VIEW_MODE.EDIT, rowIndex, mapping);
        break;
      case GRID_ACTIONS.DELETE:
        _useConfirmDialog.confirmAction(
          () => {
            deleteMapping(mapping), ModalStore.close();
          },
          {
            onNo: () => ModalStore.close(),
            title: 'Delete Mapping',
            message: 'Are you sure you want to delete this Record?',
            onClose: () => ModalStore.close(),
          }
        );
        break;
    }
  };

  /* istanbul ignore next */
  const openUpsertDialog = (mode: VIEW_MODE, rowIndex: number, mapping?: AirportMappingsModel): void => {
    ModalStore.open(
      <UpsertAirportMapping
        viewMode={mode}
        airportMappingsStore={airportMappingsStore}
        upsertMapping={(response: AirportMappingsModel) => {
          agGrid._updateTableItem(rowIndex, response), upsertMapping(rowIndex);
        }}
        airportMappingsModel={mapping}
      />
    );
  };

  /* istanbul ignore next */
  const deleteMapping = (mapping: AirportMappingsModel): void => {
    UIStore.setPageLoader(true);
    _airportMappingsStore
      .removeAirportMapping(mapping?.icao)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          ModalStore.close();
          agGrid._removeTableItems([ mapping ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => {
          ModalStore.close(), AlertStore.critical(error.message);
        },
      });
  };

  const upsertMapping = (rowIndex): void => {
    const data: AirportMappingsModel = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _airportMappingsStore
      .upsertAirportMapping(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response) {
            loadAirportMapping();
            ModalStore.close();
          }
        },
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
          AlertStore.critical(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  /* istanbul ignore next */
  const getFilterCollection = (): IAPIGridRequest => {
    if (!searchHeader.searchValue) {
      return {};
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, searchHeader.searchType)
    );
    return {
      searchCollection: JSON.stringify([
        {
          propertyName: property?.apiPropertyName,
          propertyValue: searchHeader.searchValue,
        },
      ]),
    };
  };

  /* istanbul ignore next */
  const loadAirportMapping = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...getFilterCollection(),
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _airportMappingsStore
      ?.loadAirportMappings(request)
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

  const columnDefs: ColDef[] = [
    {
      headerName: 'UV ICAO',
      field: 'icao',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('icao', 2),
    },
    {
      headerName: 'NAVBLUE Airport Code',
      field: 'navblueCode',
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value ?? '-',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('navblueCode', 2),
    },
    {
      headerName: 'APG Airport Code',
      field: 'apgCode',
      filter: 'agTextColumnFilter',
      sortable: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value ?? '-',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('apgCode', 2),
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      hide: !airportModuleSecurity.isEditable,
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          { title: 'Edit', action: GRID_ACTIONS.EDIT },
          { title: 'Delete', action: GRID_ACTIONS.DELETE },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      onFilterChanged: (e) => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return
        }
        loadAirportMapping()
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadAirportMapping();
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!airportModuleSecurity.isEditable) {
      return null;
    }
    return (
      <CustomLinkButton
        variant="contained"
        to=""
        onClick={() => openUpsertDialog(VIEW_MODE.NEW, 0, new AirportMappingsModel())}
        startIcon={<AddIcon />}
        title="Add Airport Mapping"
      />
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(AIRPORT_MAPPING_FILTERS, AIRPORT_MAPPING_FILTERS.ICAO) ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        onSearch={(sv) => loadAirportMapping()}
        onFiltersChanged={loadAirportMapping}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
      />
      <CustomAgGridReact
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadAirportMapping}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        rowsPerPageOptions={[ 10, 20, 30, 50 ]}
      />
    </>
  );
};

export default inject('airportMappingsStore', 'sidebarStore')(observer(AirportMapping));
