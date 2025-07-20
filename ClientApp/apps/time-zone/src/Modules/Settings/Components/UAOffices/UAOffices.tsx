import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, ICellEditorParams } from 'ag-grid-community';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { Utilities, UIStore, SettingsTypeModel, GRID_ACTIONS, NAME_TYPE_FILTERS, cellStyle } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AirportModel, BaseAirportStore, ModelStatusOptions, UAOfficesModel } from '@wings/shared';
import { TimeZoneSettingsStore } from '../../../Shared';
import { useGeographicModuleSecurity } from '../../../Shared/Tools';
import { AxiosError } from 'axios';
import { Logger } from '@wings-shared/security';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { observable } from 'mobx';

interface Props {
  timeZoneSettingsStore?: TimeZoneSettingsStore;
}

const UAOffices: FC<Props> = ({ timeZoneSettingsStore }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const baseAirportStore = new BaseAirportStore();
  const agGrid = useAgGrid<'', UAOfficesModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const airport: AirportModel[] = observable({
    data: [],
  });
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _timeZoneSettingsStore
      .loadUAOffices()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  /* istanbul ignore next */
  const searchAirports = (propertyValue): void => {
    const airportRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'ICAOCode.Code', propertyValue },
        { propertyName: 'UWACode', operator: 'or', propertyValue },
      ]),
    };
    baseAirportStore
      .getWingsAirports(airportRequest)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: airports => (airport.data = airports.results),
      });
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', 'NameSettingsUnique');
      return true;
    }
    return false;
  };

  const upsertUAOffices = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _timeZoneSettingsStore
      .upsertUAOffices(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: UAOfficesModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertUAOffices(rowIndex);
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
      headerName: 'ID',
      field: 'id',
      editable: false,
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: 'Airport',
      field: 'airport',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellEditorParams: {
        isRequired: () => true,
        getAutoCompleteOptions: () => airport.data,
        onSearch: value => searchAirports(value),
        valueGetter: (option: AirportModel) => option,
      },
      comparator: (current: AirportModel, next: AirportModel) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      cellEditorParams: {
        getAutoCompleteOptions: () => ModelStatusOptions,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
    },
  ];

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Called from Ag Grid Component
  const onDropDownChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
        onDropDownChange,
      },
      columnDefs: columnDefs,
      isEditable: geographicModuleSecurity.isSettingsEditable,
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
        const { id, name } = node.data as UAOfficesModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [NAME_TYPE_FILTERS.NAME]: name,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const addNewType = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new UAOfficesModel({ id: 0 }) ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    if (!geographicModuleSecurity.isSettingsEditable) {
      return;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing}
        onClick={() => addNewType()}
      >
        Add UA Office
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        placeHolder="Search by name"
        // eslint-disable-next-line max-len
        selectInputs={[ agGridUtilities.createSelectOption(NAME_TYPE_FILTERS, NAME_TYPE_FILTERS.NAME) ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('timeZoneSettingsStore')(observer(UAOffices));
