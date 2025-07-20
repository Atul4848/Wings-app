import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { AirportSettingsStore, DESTINATION_ALTERNATE_TYPE_OF_FLIGHT, useAirportModuleSecurity } from '../../../Shared';
import { ColDef, GridOptions } from 'ag-grid-community';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IdNameCodeModel, UIStore, GRID_ACTIONS, Utilities } from '@wings-shared/core';
import { useGridState, useAgGrid, agGridUtilities, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { AxiosError } from 'axios';
import { takeUntil, finalize } from 'rxjs/operators';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const DestinationAlternateTypeOfFlight: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<DESTINATION_ALTERNATE_TYPE_OF_FLIGHT, IdNameCodeModel>([], gridState);
  const _settingsStore = props.airportSettingsStore as AirportSettingsStore;
  const _useConfirmDialog = useConfirmDialog();
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .loadDestinationAlternateTOFs()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  const upsertDestinationAlternateTOF = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertDestinationAlternateTOF(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: IdNameCodeModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
          agGrid.showAlert(error.message, 'upsertDestinationAlternateTOF')
        },
      });
  };

  /* istanbul ignore next */
  const removeRecord = (rowIndex: number): void => {
    ModalStore.close();
    const rowData = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _settingsStore
      .removeDestinationAlternateTOF(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ rowData ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, 'name');
        break;
      case GRID_ACTIONS.SAVE:
        upsertDestinationAlternateTOF(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        _useConfirmDialog.confirmAction(() => removeRecord(rowIndex), { isDelete: true, title: 'Confirm Delete' });
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  // Called from Ag Grid Component
  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const addNewType = (): void => {
    agGrid.addNewItems([ new IdNameCodeModel() ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        isUnique: (value: string) => {
          return !props.airportSettingsStore?.destinationAlternateTOFs.some(({ name }) =>
            Utilities.isEqual(name, value?.trim())
          );
        },
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        rules: 'string|max:10',
        isUnique: (value: string) => {
          return !props.airportSettingsStore?.destinationAlternateTOFs.some(({ code }) =>
            Utilities.isEqual(code, value?.trim())
          );
        },
      },
    },
    {
      ...agGrid.actionColumn({ hide: !airportModuleSecurity.isSettingsEditable }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
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
        const { id, code, name } = node.data as IdNameCodeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [DESTINATION_ALTERNATE_TYPE_OF_FLIGHT.NAME]: name,
              [DESTINATION_ALTERNATE_TYPE_OF_FLIGHT.CODE]: code,
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
        Add Destination Alternate Type Of Flight
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[
          agGridUtilities.createSelectOption(
            DESTINATION_ALTERNATE_TYPE_OF_FLIGHT,
            DESTINATION_ALTERNATE_TYPE_OF_FLIGHT.NAME
          ),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('airportSettingsStore')(observer(DestinationAlternateTypeOfFlight));
