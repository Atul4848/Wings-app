import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { AVIONICS_MODEL_FILTERS, AvionicsSettingsStore, AesModel, useAircraftModuleSecurity } from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { forkJoin } from 'rxjs';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  avionicsSettingsStore?: AvionicsSettingsStore;
}

const AesModelComponent: FC<Props> = ({ avionicsSettingsStore }) => {
  const alertMessageId: string = 'AesModelAlertMessage';
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AVIONICS_MODEL_FILTERS, AesModel>([], gridState);
  const _settingsStore = avionicsSettingsStore as AvionicsSettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getAesModels(), _settingsStore.getAesManufacturers() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ aesModels ]) => gridState.setGridData(aesModels));
  };

  const addNewType = () => {
    agGrid.addNewItems([ new AesModel({ id: 0 }) ], {
      startEditing: false,
      colKey: 'name',
    });
    gridState.setHasError(true);
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Called from Ag Grid Component
  const onDropDownChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAesModel(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', alertMessageId);
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertAesModel = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertAesModel(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AesModel) => {
          agGrid._sortColumns(rowIndex, response, 'name');
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: 'required|string|between:1,50',
      },
    },
    {
      headerName: 'Manufacturer',
      field: 'aesManufacturer',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'AES Manufacturer',
        getAutoCompleteOptions: () => _settingsStore.aesManufacturers,
        valueGetter: (option: SettingsTypeModel) => option,
      },
    },
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !aircraftModuleSecurity.isSettingsEditable,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: aircraftModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, aesManufacturer } = node.data as AesModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AVIONICS_MODEL_FILTERS.NAME]: name,
              [AVIONICS_MODEL_FILTERS.MANUFACTURER]: aesManufacturer.name,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!aircraftModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addNewType}
      >
        Add AES Model
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(AVIONICS_MODEL_FILTERS, AVIONICS_MODEL_FILTERS.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
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

export default inject('avionicsSettingsStore')(observer(AesModelComponent));
