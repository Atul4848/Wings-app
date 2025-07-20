import React, { FC, useEffect, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { AlertStore } from '@uvgo-shared/alert';
import { GRID_ACTIONS, UIStore, Utilities, cellStyle } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  AIRPORT_CATEGORY_FILTERS,
  AirportCategoryModel,
  AirportSettingsStore,
  useAirportModuleSecurity
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const AirportCategoryV2: FC<Props> = ({ airportSettingsStore }: Props) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_CATEGORY_FILTERS, AirportCategoryModel>([], gridState);
  const _settingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _settingsStore
      .loadAirportCategory()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: AirportCategoryModel[]) => (gridState.data = response));
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Airport Category Name should be unique', 'ConditionTypeConfig');
      return true;
    }
    return false;
  };

  const upsertSettings = (rowIndex: number): void => {
    const data: AirportCategoryModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id)) {
      return;
    }

    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertAirportCategory(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportCategoryModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        upsertSettings(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const addNewCategory = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    const airportCategoryType = new AirportCategoryModel({ id: 0 });
    agGrid.addNewItems([ airportCategoryType ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    if (!airportModuleSecurity.isSettingsEditable) {
      return null;
    }

    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isProcessing}
        onClick={addNewCategory}
      >
        Add Airport Category
      </PrimaryButton>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,10',
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:0,100',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      hide: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getEditableState: node => !Boolean(node.id),
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, name, description } = node.data as AirportCategoryModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRPORT_CATEGORY_FILTERS.NAME]: name,
              [AIRPORT_CATEGORY_FILTERS.DESCRIPTION]: description,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('actionRenderer', false);
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(AIRPORT_CATEGORY_FILTERS, AIRPORT_CATEGORY_FILTERS.NAME),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('airportSettingsStore')(observer(AirportCategoryV2));
