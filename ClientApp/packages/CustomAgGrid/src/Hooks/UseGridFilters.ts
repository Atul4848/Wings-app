import {
  IAPIFilterDictionary,
  IAPIGridRequest,
  IAPISearchFilter,
  IGridSortFilter,
  SORTING_DIRECTION,
  Utilities,
} from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ColDef, ColGroupDef, RowNode, SortChangedEvent } from 'ag-grid-community';
import { useEffect } from 'react';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { IGridState } from '../Components';
import { IAPISortFilter } from '../Interfaces';

export function useGridFilters<T extends string>(apiFilterDictionary: IAPIFilterDictionary<T>[], gridState: IGridState) {
  const unsubscribe = useUnsubscribe();
  const onAdvanceFilterChange$ = unsubscribe.gridAdvancedSearchFilterDebounce$.pipe(
    debounceTime(1000),
    takeUntil(unsubscribe.destroy$)
  );

  useEffect(() => {
    unsubscribe.debounce$
      .pipe(debounceTime(unsubscribe.debounceTime), takeUntil(unsubscribe.destroy$))
      .subscribe(() => {
        Array.from(gridState.columFilters.keys()).forEach((coldId: string) => {
          const filterAPI = gridState.gridApi.getFilterApiForColDef(coldId);
          const values: any = Array.from(gridState.columFilters).find(x => x[0] === coldId)[1];

          if (typeof filterAPI.setMiniFilter === 'function') {
            //first we need to reset mini filter
            filterAPI.setMiniFilter('');
            filterAPI.setMiniFilter(values.searchValue);
          } else {
            filterAPI.eValueFrom1.value = values.searchValue;
          }
        });
      });
  }, []);

  // update search value with debounce time to add some time delay before making api call
  const gridAdvancedSearchFilterApplied = (): void => {
    if (Array.from(gridState.columFilters).length) {
      unsubscribe.debounce$.next();
    }
  }

  // ag grid life cycle method
  const onSortChanged = ({ api, columnApi }: SortChangedEvent): void => {
    if (!gridState.gridApi) {
      return;
    }
    // redraw rows to get the updated row index
    gridState.gridApi.redrawRows();
    gridState.setInitialColDefs(api.getColumnDefs());
    if (columnApi.getColumnState().some(x => x.sort)) {
      gridState.setSortFilters(
        columnApi
          .getColumnState()
          .filter(x => x.sort)
          .map(({ sort, colId }) => ({ sort, colId }))
      );
      return;
    }

    return gridState.setSortFilters([]);
  };

  // Private Ignore sorting for new Row
  const postSort = (rowNodes: RowNode[]): void => {
    const rowIndex = rowNodes.findIndex(({ data }) => !Boolean(data.id));
    if (rowIndex !== -1) {
      const addIndex: number = gridState.gridApi?.getFirstDisplayedRow();
      rowNodes.splice(addIndex, 0, rowNodes.splice(rowIndex, 1)[0]);
    }
  };

  // ag grid life cycle method
  const onFilterChanged = (): void => {
    // redraw rows to get the updated rowIndex
    if (!gridState.gridApi) {
      return;
    }

    gridState.gridApi.redrawRows();
    if (!gridState.gridApi.getDisplayedRowCount()) {
      gridState.gridApi.showNoRowsOverlay();
      return;
    }
    gridState.gridApi.hideOverlay();
  };

  /* istanbul ignore next */
  // Called From Col Def Of the AgGrid Components
  const getAdvanceFilterParams = (colId: string, textLength: number = 2, searchType: string = 'contains') => ({
    filterOptions: [ searchType ],
    trimInput: true,
    debounceMs: 500,
    suppressAndOrCondition: true,
    textCustomComparator: () => true,
    // Used to Save Filters when any value changed
    filterModifiedCallback: () => {
      const filterAPI = gridState.gridApi.getFilterApiForColDef(colId);
      const searchValue: string = filterAPI.eValueFrom1.eInput.value || '';
      const columnId = Array.from(gridState.columFilters.keys()).find(coldId => Utilities.isEqual(coldId, colId));
      let values: any;
      if (Boolean(columnId)) {
        values = Array.from(gridState.columFilters)?.find(x => x[0] === colId)[1];
      }
      if ((!Boolean(columnId) && !Boolean(searchValue)) || Utilities.isEqual(values?.searchValue, searchValue)) {
        return;
      }

      // Clear Search Filter if Applied earlier
      if (!searchValue) {
        gridState.removeColumnFilter(colId);
        gridState.gridApi.onFilterChanged();
        return;
      }

      // Do not apply filter until text length matched
      if (searchValue && searchValue.length < textLength) {
        gridState.removeColumnFilter(colId);
        filterAPI.setModel(null);
        return;
      }
      // Apply Search Filter
      if (
        !Boolean(searchValue) ||
        (Utilities.isEqual(searchType, 'start') && searchValue.length >= 1) ||
        (Utilities.isEqual(searchType, 'contains') && searchValue.length >= textLength)
      ) {
        gridState.setColumnFilter(colId, { searchType, searchValue });
        unsubscribe.gridAdvancedSearchFilterDebounce$.next();
      }
    },
  });

  // return applied filters in API format
  const getAdvancedSearchFilters = () => {
    if (!gridState.isColumnFilterApplied) {
      return null;
    }
    const gridAPISearchFilters: IAPISearchFilter[] = Array.from(gridState.columFilters.keys()).reduce<
      IAPISearchFilter[]
    >((acc: IAPISearchFilter[], coldId: string) => {
      const property = apiFilterDictionary.find(({ columnId }) => Utilities.isEqual(columnId, coldId));
      const values: any = Array.from(gridState.columFilters).find(x => x[0] === coldId)[1];
      if (property) {
        acc.push({
          propertyName: property.apiPropertyName,
          operator: 'and',
          propertyValue: values.searchValue,
          isArray: property.isArray,
          searchType: values.searchType === 'contains' ? '' : values.searchType,
        });
      }
      return acc;
    }, []);
    return gridAPISearchFilters.length ? { searchCollection: JSON.stringify(gridAPISearchFilters) } : null;
  };

  // Filters If Filters are applied on Grid Column
  const gridColumnFilters = (useAsSearchCollection = false) => {
    if (!gridState.isColumnFilterApplied) {
      return null;
    }

    const gridAPISearchFilters: IAPISearchFilter[] = Array.from(gridState.columFilters.keys()).reduce<
      IAPISearchFilter[]
    >((acc: IAPISearchFilter[], coldId: string) => {
      const filterAPI = gridState.gridApi.getFilterApiForColDef(gridState.gridApi.getColumnDef(coldId));
      let selectedValues: string[] = [];

      if (Boolean(filterAPI?.valueModel)) {
        selectedValues = Array.from(filterAPI?.valueModel?.selectedValues);
      }

      const property = apiFilterDictionary.find(({ columnId }) => Utilities.isEqual(columnId, coldId));
      if (property && selectedValues.length > 0) {
        const hasMultiValue: boolean = selectedValues.length > 1;
        acc.push({
          propertyName: property.apiPropertyName,
          operator: 'and',
          propertyValue: hasMultiValue ? selectedValues : selectedValues[0],
          filterType: hasMultiValue ? 'in' : 'eq',
          isArray: property.isArray,
        });
      }
      return acc;
    }, []);
    return gridAPISearchFilters.length ? { filterCollection: JSON.stringify(gridAPISearchFilters) } : null;
  };

  // Filters If Sorting Is Applied on Grid
  const gridSortFilters = () => {
    if (!Array.isArray(gridState.sortFilters)) {
      return null;
    }
    const apiSortFilters: IAPISortFilter[] = gridState.sortFilters.reduce<IAPISortFilter[]>(
      (acc: IAPISortFilter[], currentValue: IGridSortFilter) => {
        const property = apiFilterDictionary.find(({ columnId }) => Utilities.isEqual(columnId, currentValue.colId));
        if (property) {
          acc.push({
            propertyName: property.apiPropertyName,
            isAscending: currentValue.sort === SORTING_DIRECTION.ASCENDING,
          });
        }
        return acc;
      },
      []
    );
    return apiSortFilters.length ? { sortCollection: JSON.stringify(apiSortFilters) } : null;
  };

  const getSearchFilters = (searchValue:string,selectedOption:string): IAPIGridRequest =>{
    if (!searchValue) {
      return null;
    }
    const property = apiFilterDictionary.find(
      ({ uiFilterType }) => Utilities.isEqual(uiFilterType, selectedOption)
    );

    if (!property) {
      return null;
    }

    const searchCollection = Array.isArray(searchValue)
      ? searchValue.map((_searchValue, index) => {
        const operator = Boolean(index) ? { operator: 'or' } : null;
        return {
          propertyName: property.apiPropertyName,
          propertyValue: _searchValue,
          isArray: property.isArray,
          ...operator,
        };
      })
      : [
        {
          propertyName: property.apiPropertyName,
          propertyValue: searchValue,
          isArray: property.isArray,
        },
      ];
    
    return {
      searchCollection: JSON.stringify(searchCollection),
    };
  }

  // suppress filters and sortable in row editing mode to prevent user interaction
  const suppressFilters = (suppress: boolean): void => {
    if (!suppress) {
      gridState.gridApi.setColumnDefs(gridState.initialColDefs);
      return;
    }
    const colDefs: (ColDef | ColGroupDef)[] = gridState.gridApi.getColumnDefs().map((column: ColDef | ColGroupDef) => {
      column = setColDefProp(column, 'suppressMenu', true);
      column = setColDefProp(column, 'sortable', false);
      // needs for group columns
      if ('children' in column && column.children.length) {
        column.children = column.children.map((childColumn: ColDef) => {
          childColumn = setColDefProp(childColumn, 'suppressMenu', true);
          childColumn = setColDefProp(childColumn, 'sortable', false);
          return childColumn;
        });
      }
      return column;
    });
    gridState.gridApi.setColumnDefs(colDefs);
  };

  const setColDefProp = (colDef: ColDef, key: keyof ColDef, value: boolean): ColDef | ColGroupDef => {
    return { ...colDef, [key]: value };
  };

  // Remove All Column Filters from ag grid header
  const resetColumnFilters = (): void => {
    Array.from(gridState.columFilters.keys()).forEach((key: string) => {
      // Set Model Clear the applied filter model
      gridState.gridApi.getFilterApiForColDef(key)?.setModel(null);
    });
    gridState.resetColumnFilter();
    gridState.gridApi.onFilterChanged();
  };

  return {
    apiFilterDictionary,
    getAdvanceFilterParams,
    getAdvancedSearchFilters,
    gridSortFilters,
    gridColumnFilters,
    resetColumnFilters,
    suppressFilters,
    onFilterChanged,
    postSort,
    onSortChanged,
    onAdvanceFilterChange$,
    gridAdvancedSearchFilterApplied,
    getSearchFilters
  };
}
