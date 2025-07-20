import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { DOCUMENT_FILTER, PermitSettingsStore, usePermitModuleSecurity } from '../../../Shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { IdNameCodeModel, UIStore, Utilities, cellStyle, GRID_ACTIONS } from '@wings-shared/core';
import { gridFilters } from './field';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, ICellRendererParams, ICellEditor } from 'ag-grid-community';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  AgGridActions,
  CustomAgGridReact,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';

interface Props extends ICellRendererParams {
  permitSettingsStore: PermitSettingsStore;
}

const Document: FC<Props> = observer(({ permitSettingsStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<DOCUMENT_FILTER, IdNameCodeModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const permitModuleSecurity = usePermitModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    permitSettingsStore
      .getDocuments()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IdNameCodeModel[]) => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: IdNameCodeModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'code' ] });
    const value = editorInstance[0].getValue();
    const isDuplicateData = gridState.data.some(a => Utilities.isEqual(a.code, value) && data?.id !== a.id);
    if (isDuplicateData) {
      AlertStore.critical(`Document already exists for Code - ${value}`);
    }
    return isDuplicateData;
  };

  /* istanbul ignore next */
  const upsertDocument = (rowIndex: number): void => {
    const rowData: IdNameCodeModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(rowData)) {
      return;
    }
    gridState.gridApi.stopEditing();

    UIStore.setPageLoader(true);
    permitSettingsStore
      .upsertDocuments(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: IdNameCodeModel) => {
          agGrid._updateTableItem(rowIndex, response);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        upsertDocument(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,12',
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: cellStyle(),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: permitModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => false,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      pagination: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, code } = node.data as IdNameCodeModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [DOCUMENT_FILTER.NAME]: name,
              [DOCUMENT_FILTER.CODE]: code,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
      onRowEditingStarted: params => agGrid.onRowEditingStarted(params),
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
      },
    };
  };

  const addNewDocument = () => {
    const document = new IdNameCodeModel({ id: 0 });
    agGrid.addNewItems([ document ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    if (!permitModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton variant="contained" startIcon={<AddIcon />} onClick={addNewDocument}>
        Add Document
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(DOCUMENT_FILTER, DOCUMENT_FILTER.CODE, 'defaultOption') ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
});

export default inject('permitSettingsStore')(Document);
