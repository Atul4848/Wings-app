import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AirportHoursBufferModel,
  AirportHoursSubTypeModel,
  AirportHoursTypeModel,
  AirportSettingsStore,
  AIRPORT_HOUR_BUFFER_FILTER,
  useAirportModuleSecurity,
} from '../../../Shared';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { DATE_FORMAT, IAPIGridRequest, UIStore, Utilities, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const AirportHourBuffers: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_HOUR_BUFFER_FILTER, AirportHoursBufferModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadAirportHourBuffers();
  }, []);

  /* istanbul ignore next */
  const loadAirportHourBuffers = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
    };
    _airportSettingsStore
      .loadAirportHourBuffers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response.results));
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
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAirportHourBuffer(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const upsertAirportHourBuffer = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .upsertAirportHourBuffer(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportHoursBufferModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertAirportHourBuffer'),
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Airport Hour Type ',
      field: 'airportHoursType',
      editable: false,
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursTypeModel, next: AirportHoursTypeModel) => {
        return Utilities.customComparator(current, next, 'name');
      },
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Hour Type',
        getAutoCompleteOptions: () => _airportSettingsStore.airportHourTypes,
      },
    },
    {
      headerName: 'Sub Type',
      field: 'airportHoursBufferSubType',
      editable: false,
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursSubTypeModel, next: AirportHoursSubTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Hour Sub Type',
        getAutoCompleteOptions: () => _airportSettingsStore.airportHourSubTypes,
      },
    },
    {
      headerName: 'Buffer',
      field: 'buffer',
      cellEditorParams: {
        rules: 'required|numeric|between:0,1440',
      },
    },
    {
      headerName: 'Created By',
      field: 'createdBy',
      editable: false,
    },
    {
      headerName: 'Created On',
      field: 'createdOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: 'Modified By',
      field: 'modifiedBy',
      editable: false,
    },
    {
      headerName: 'Modified On',
      field: 'modifiedOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
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
      context: { onInputChange },
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
      suppressClickEdit: !gridState.isRowEditing,
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
      },
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, airportHoursType, airportHoursBufferSubType, buffer } = node.data as AirportHoursBufferModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRPORT_HOUR_BUFFER_FILTER.HOURS_TYPE]: airportHoursType.name,
              [AIRPORT_HOUR_BUFFER_FILTER.HOURS_SUB_TYPE]: airportHoursBufferSubType.name,
              [AIRPORT_HOUR_BUFFER_FILTER.HOURS_BUFFER]: buffer.toString(),
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(AIRPORT_HOUR_BUFFER_FILTER, AIRPORT_HOUR_BUFFER_FILTER.HOURS_TYPE),
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

export default inject('airportSettingsStore')(observer(AirportHourBuffers));
