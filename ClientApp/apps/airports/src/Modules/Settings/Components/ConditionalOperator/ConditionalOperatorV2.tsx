import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import {
  CONDITIONAL_OPERATOR_FILTERS,
  AirportSettingsStore,
  ConditionalOperatorModel,
  useAirportModuleSecurity
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  isEditable?: boolean;
}

const ConditionalOperator: FC<Props> = ({ airportSettingsStore, isEditable }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<CONDITIONAL_OPERATOR_FILTERS, ConditionalOperatorModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .getConditionalOperators()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  const upsertConditionalOperator = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .upsertConditionalOperator(agGrid._getTableItem(rowIndex))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ConditionalOperatorModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
        },
      });
  };

  const addNewType = () => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems(
      [
        new ConditionalOperatorModel({
          id: 0,
          operator: '',
        }),
      ],
      { startEditing: false, colKey: 'operator' }
    );
    gridState.setHasError(true);
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        upsertConditionalOperator(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Operator',
      field: 'operator',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,100',
        isUnique: (value: string) => {
          return !_airportSettingsStore?.conditionalOperators.some(
            ({ operator }) => operator.toLowerCase() === value?.toLowerCase()
          );
        },
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      hide: !airportModuleSecurity.isSettingsEditable || !isEditable,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: !gridState.isRowEditing,
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('actionRenderer', Boolean(isEditable));
      },
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, operator } = node.data as ConditionalOperatorModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [CONDITIONAL_OPERATOR_FILTERS.OPERATOR]: operator,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!airportModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addNewType}
      >
        Add Conditional Operator
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[
          agGridUtilities.createSelectOption(CONDITIONAL_OPERATOR_FILTERS, CONDITIONAL_OPERATOR_FILTERS.OPERATOR),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
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

export default inject('airportSettingsStore')(observer(ConditionalOperator));
