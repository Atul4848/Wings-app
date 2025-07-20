import React, { FC, ReactNode, useEffect } from 'react';
import { AxiosError } from 'axios';
import { inject, observer } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { useUnsubscribe } from '@wings-shared/hooks';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { IdNameCodeModel, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AirportSettingsStore, DOCUMENT_FILTER, useAirportModuleSecurity } from '../../../Shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';

interface Props extends Partial<ICellRendererParams> {
  airportSettingsStore?: AirportSettingsStore;
}

const Document: FC<Props> = observer(({ airportSettingsStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<DOCUMENT_FILTER, IdNameCodeModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const { isSettingsEditable } = useAirportModuleSecurity();
  const _settingsStore = airportSettingsStore as AirportSettingsStore;

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .loadDocuments()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IdNameCodeModel[]) => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const upsertDocument = (rowIndex: number): void => {
    const rowData: IdNameCodeModel = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertDocument(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: IdNameCodeModel) => {
          agGrid._updateTableItem(rowIndex, response);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
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

  const addNewDocument = () => {
    const document = new IdNameCodeModel({ id: 0 });
    agGrid.addNewItems([ document ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,12',
        isUnique: (value: string) => {
          return !_settingsStore?.documents.some(({ code }) => Utilities.isEqual(code, value?.trim()));
        },
      },
    },
    {
      ...agGrid.actionColumn({ hide: !isSettingsEditable, minWidth: 150, maxWidth: 210 }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => false,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
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
    };
  };

  const rightContent = (): ReactNode => {
    if (!isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        onClick={addNewDocument}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
      >
        Add Document
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(DOCUMENT_FILTER, DOCUMENT_FILTER.NAME) ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
});

export default inject('airportSettingsStore')(Document);
