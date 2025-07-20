import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { AircraftVariationModel, AircraftVariationStore, VARIATION_SEARCH_FILTERS } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useStyles } from './VariationSearch.styles';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, GridPagination, IAPIGridRequest } from '@wings-shared/core';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { variationGridFilters } from './fields';

interface Props {
  aircraftVariationStore?: AircraftVariationStore;
  onSelect: (selectedVariation: AircraftVariationModel) => void;
}

const VariationSearch: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const _variationStore = props.aircraftVariationStore as AircraftVariationStore;
  const agGrid = useAgGrid<VARIATION_SEARCH_FILTERS, AircraftVariationModel>(variationGridFilters, gridState);

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
    loadInitialData();
  }, []);

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: 30,
      ...pageRequest,
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    UIStore.setPageLoader(true);
    _variationStore
      .getAircraftVariations(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'ICAO Type Designator',
      field: 'icaoTypeDesignator',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('icaoTypeDesignator', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'A/C Make',
      field: 'make',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('make', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'A/C Model',
      field: 'model',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('model', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Series',
      field: 'series',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('series', 1),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Engine Type',
      field: 'engineType',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('engineType', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Popular Names',
      field: 'popularNames',
      cellRenderer: 'agGridChipView',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('popularNames', 2),
    },
    {
      headerName: '',
      field: 'action',
      cellRenderer: 'viewRenderer',
      filter: false,
      minWidth: 100,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => viewRenderer(node.data),
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
      },
      onFilterChanged: (e) => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
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
  const viewRenderer = (rowData: AircraftVariationModel): ReactNode => {
    return (
      <PrimaryButton
        variant="outlined"
        color="primary"
        onClick={() => props.onSelect(rowData)}
        disabled={UIStore.pageLoading}>
        Select
      </PrimaryButton>
    );
  };


  return (
    <div className={classes.container}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(VARIATION_SEARCH_FILTERS, VARIATION_SEARCH_FILTERS.ICAO_TYPE_DESIGNATOR),
        ]}
        onSearch={(sv) => loadInitialData()}
        onFiltersChanged={loadInitialData}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={request => loadInitialData(request)}
      />
    </div>
  );
};

export default inject('aircraftVariationStore')(observer(VariationSearch));
