import React, { FC, ReactNode, useEffect, } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams, RowNode } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { forkJoin } from 'rxjs';
import {
  AIRPORT_HOUR_SUB_TYPE_FILTERS,
  AirportSettingsStore,
  AirportHoursSubTypeModel,
  AirportHoursTypeModel,
  useAirportModuleSecurity,
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, regex, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, agGridUtilities, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const AirportHourSubType: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_HOUR_SUB_TYPE_FILTERS, AirportHoursSubTypeModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _airportSettingsStore.loadAirportHourSubTypes(), _airportSettingsStore.loadAirportHourTypes() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: ([ airportHourSubTypes ]) => {
          gridState.setGridData(airportHourSubTypes);
        },
        error: (error: AxiosError) => Logger.error(error.message),
      });
  };

  /* istanbul ignore next */
  const addNewType = () => {
    const airportHourSubTypes = new AirportHoursSubTypeModel();
    agGrid.addNewItems([ airportHourSubTypes ], { startEditing: false, colKey: 'sequenceId' });
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
        upsertAirportHourSubTypes(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const upsertAirportHourSubTypes = (rowIndex: number): void => {
    const model: AirportHoursSubTypeModel = agGrid._getTableItem(rowIndex);
    const isSequenceIdExists = agGrid._isAlreadyExists([ 'sequenceId', 'airportHoursType' ], model.id, rowIndex);
    if (isSequenceIdExists) {
      agGrid.showAlert('Sequence Id should be unique.', 'airportHourSubTypeAlertMessageId');
      return;
    }

    const isNameExists = agGrid._isAlreadyExists([ 'name', 'airportHoursType' ], model.id, rowIndex);
    if (isNameExists) {
      agGrid.showAlert('Name should be unique.', 'airportHourSubTypeAlertMessageId');
      return;
    }

    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .upsertAirportHourSubTypes(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportHoursSubTypeModel) => {
          agGrid._updateTableItem(rowIndex, response);
          if (gridState.sortFilters) {
            gridState.setGridData(Utilities.customArraySort(gridState.data, gridState.sortFilters[0]?.colId));
          }
          gridState.setGridData(Utilities.customArraySort(gridState.data, 'airportHoursType.name', 'sequenceId'));
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
      headerName: 'Sequence Id',
      field: 'sequenceId',
      cellEditorParams: {
        isRequired: true,
        rules: `required|numeric|regex:${regex.numeric}`,
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        ignoreNumber: true,
        rules: 'required|string|between:1,255',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:0,500',
      },
    },
    {
      headerName: 'Airport Hours Type',
      field: 'airportHoursType',
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value.name,
      comparator: (current: AirportHoursTypeModel, next: AirportHoursTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Airport Hours Type',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
        getAutoCompleteOptions: () => _airportSettingsStore.airportHourTypes,
        valueGetter: option => option,
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      hide: !airportModuleSecurity.isSettingsEditable,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, name, airportHoursType } = node.data as AirportHoursSubTypeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRPORT_HOUR_SUB_TYPE_FILTERS.NAME]: name,
              [AIRPORT_HOUR_SUB_TYPE_FILTERS.TYPE]: airportHoursType.name,
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
        Add Airport Hour Sub Type
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(AIRPORT_HOUR_SUB_TYPE_FILTERS, AIRPORT_HOUR_SUB_TYPE_FILTERS.NAME),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        rightContent={rightContent}
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

export default inject('airportSettingsStore')(observer(AirportHourSubType));
