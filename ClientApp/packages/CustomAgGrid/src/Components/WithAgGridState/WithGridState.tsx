import React from 'react';
import { observable } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import { GridApi, ColumnApi, ColDef } from 'ag-grid-community';
import { GridPagination } from '@wings-shared/core';
import { Subject } from 'rxjs';

export interface IGridState {
  data: any[];
  clickedRowIndex: number;
  isRowEditing: boolean;
  hasSelectedRows: boolean;
  hasError: boolean;
  commonErrorMessage: string;
  toggleAutoSizeColumns: boolean;
  isProcessing: boolean;
  allowSelectAll: boolean;
  isAllRowsSelected: boolean;
  sortFilters: [];
  gridApi: GridApi;
  pagination: GridPagination;
  columnApi: ColumnApi;
  initialColDefs: ColDef[]; // Used to reset col def to default
  columFilters: Map<string, object>;
  isRowEditingStarted$: Subject<boolean>;
  isColumnFilterApplied: boolean;
  setHasSelectedRows: (hasSelectedRows: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setAllowSelectAll: (isProcessing: boolean) => void;
  setIsAllRowsSelected: (isAllRowsSelected: boolean) => void;
  setHasError: (hasError: boolean) => void;
  setToggleAutoSizeColumns: (toggleAutoSizeColumns: boolean) => void;
  setIsRowEditing: (isRowEditing: boolean) => void;
  setGridApi: (gridApi: GridApi) => void;
  setColumnApi: (columnApi: ColumnApi) => void;
  setInitialColDefs: (initialColDefs: ColDef[]) => void;
  setSortFilters: (sortFilters: ColDef[]) => void;
  // Column Filters
  setColumnFilter: (key: string, filters: object) => void;
  removeColumnFilter: (key: string) => void;
  resetColumnFilter: () => void;
  // when custom column filter changed
  onColumnFilterChanged: () => void;
  setPagination: (pagination: GridPagination) => void;
  setGridData: (data: any[]) => void;
  setClickedRowIndex: (clickedRowIndex: number) => void;
  setCommonErrorMessage: (error: string) => void;
}

/* istanbul ignore next */
// withGridState takes component as param and inject gridState props into it
export const withGridState = Component =>
  observer(props => {
    // Pass this observable state to component
    const gridState = observable({
      data: [],
      clickedRowIndex: null,
      hasSelectedRows: false,
      pagination: new GridPagination(),
      hasError: false,
      isProcessing: false,
      allowSelectAll: true,
      isAllRowsSelected: false,
      toggleAutoSizeColumns: false,
      isRowEditing: false,
      gridApi: null,
      columnApi: null,
      initialColDefs: [],
      sortFilters: [],
      columFilters: new Map(),
      isColumnFilterApplied: false,
      commonErrorMessage: '',
      isRowEditingStarted$: new Subject<boolean>(),
      onColumnFilterChanged: () => {},
      setHasSelectedRows: (hasSelectedRows: boolean) => (gridState.hasSelectedRows = hasSelectedRows),
      setIsProcessing: (isProcessing: boolean) => (gridState.isProcessing = isProcessing),
      setIsRowEditing: (isRowEditing: boolean) => (gridState.isRowEditing = isRowEditing),
      setAllowSelectAll: (allowSelectAll: boolean) => (gridState.allowSelectAll = allowSelectAll),
      setIsAllRowsSelected: (isAllRowsSelected: boolean) => (gridState.isAllRowsSelected = isAllRowsSelected),
      setHasError: (hasError: boolean) => (gridState.hasError = hasError),
      setToggleAutoSizeColumns: (toggleAutoSizeColumns: boolean) => {
        gridState.toggleAutoSizeColumns = toggleAutoSizeColumns;
      },
      setGridApi: (gridApi: GridApi) => (gridState.gridApi = gridApi),
      setColumnApi: (columnApi: ColumnApi) => (gridState.columnApi = columnApi),
      setInitialColDefs: (initialColDefs: ColDef[]) => (gridState.initialColDefs = initialColDefs),
      setSortFilters: (sortFilters: ColDef[]) => (gridState.sortFilters = sortFilters),
      setColumnFilter: (key: string, value: object) => {
        gridState.columFilters = new Map(gridState.columFilters.set(key, value));
        gridState.isColumnFilterApplied = gridState.columFilters.size > 0;
        gridState.onColumnFilterChanged();
      },
      removeColumnFilter: (key: string) => {
        gridState.columFilters.delete(key);
        gridState.columFilters = new Map(gridState.columFilters);
        gridState.isColumnFilterApplied = gridState.columFilters.size > 0;
        gridState.onColumnFilterChanged();
      },
      resetColumnFilter: () => {
        gridState.columFilters = new Map();
        gridState.isColumnFilterApplied = false;
      },
      setPagination: updatedPagination => {
        gridState.pagination = updatedPagination;
      },
      setGridData: data => {
        gridState.data = data;
      },
      setClickedRowIndex: (clickedRowIndex: number) => {
        gridState.clickedRowIndex = clickedRowIndex;
      },
      setCommonErrorMessage: error => {
        gridState.commonErrorMessage = error;
      },
    });

    return <Component gridState={gridState} {...props} />;
  });

/* istanbul ignore next */
// New Implementation Will Remove HOC After testing
export const useGridState = () => {
  const gridState = useLocalStore<IGridState>(() => ({
    data: [],
    clickedRowIndex: null,
    hasSelectedRows: false,
    pagination: new GridPagination(),
    hasError: false,
    isProcessing: false,
    allowSelectAll: true,
    isAllRowsSelected: false,
    toggleAutoSizeColumns: false,
    isRowEditing: false,
    gridApi: null,
    columnApi: null,
    initialColDefs: [],
    sortFilters: [],
    columFilters: new Map(),
    isColumnFilterApplied: false,
    commonErrorMessage: '',
    isRowEditingStarted$: new Subject<boolean>(),
    onColumnFilterChanged: () => {},
    setHasSelectedRows: (hasSelectedRows: boolean) => (gridState.hasSelectedRows = hasSelectedRows),
    setIsProcessing: (isProcessing: boolean) => (gridState.isProcessing = isProcessing),
    setIsRowEditing: (isRowEditing: boolean) => (gridState.isRowEditing = isRowEditing),
    setAllowSelectAll: (allowSelectAll: boolean) => (gridState.allowSelectAll = allowSelectAll),
    setIsAllRowsSelected: (isAllRowsSelected: boolean) => (gridState.isAllRowsSelected = isAllRowsSelected),
    setHasError: (hasError: boolean) => (gridState.hasError = hasError),
    setToggleAutoSizeColumns: (toggleAutoSizeColumns: boolean) => {
      gridState.toggleAutoSizeColumns = toggleAutoSizeColumns;
    },
    setGridApi: (gridApi: GridApi) => (gridState.gridApi = gridApi),
    setColumnApi: (columnApi: ColumnApi) => (gridState.columnApi = columnApi),
    setInitialColDefs: (initialColDefs: ColDef[]) => (gridState.initialColDefs = initialColDefs),
    setSortFilters: (sortFilters: ColDef[]) => (gridState.sortFilters = sortFilters),
    setColumnFilter: (key: string, value: object) => {
      gridState.columFilters = new Map(gridState.columFilters.set(key, value));
      gridState.isColumnFilterApplied = gridState.columFilters.size > 0;
      gridState.onColumnFilterChanged();
    },
    removeColumnFilter: (key: string) => {
      gridState.columFilters.delete(key);
      gridState.columFilters = new Map(gridState.columFilters);
      gridState.isColumnFilterApplied = gridState.columFilters.size > 0;
      gridState.onColumnFilterChanged();
    },
    resetColumnFilter: () => {
      gridState.columFilters = new Map();
      gridState.isColumnFilterApplied = false;
    },
    setPagination: updatedPagination => {
      gridState.pagination = updatedPagination;
    },
    setGridData: data => {
      gridState.data = data;
    },
    setClickedRowIndex: (clickedRowIndex: number) => {
      gridState.clickedRowIndex = clickedRowIndex;
    },
    setCommonErrorMessage: error => {
      gridState.commonErrorMessage = error;
    },
  }));

  return gridState as IGridState;
};
