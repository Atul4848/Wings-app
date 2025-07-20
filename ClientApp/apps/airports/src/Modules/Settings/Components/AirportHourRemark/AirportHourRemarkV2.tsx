import React, { FC, ReactNode, useEffect } from 'react';
import {
  ColDef,
  GridOptions,
  ICellEditorParams,
  ValueFormatterParams,
  RowEditingStartedEvent,
  RowNode,
} from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { observable } from 'mobx';
import { forkJoin, Observable } from 'rxjs';
import {
  AIRPORT_HOUR_REMARKS_FILTERS,
  AirportSettingsStore,
  AirportHoursSubTypeModel,
  AirportHourRemarksModel,
  AirportHoursTypeModel,
  useAirportModuleSecurity,
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, regex, ISelectOption, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, agGridUtilities, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const AirportHourSubType: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_HOUR_REMARKS_FILTERS, AirportHourRemarksModel>([], gridState);
  const airportHourSubTypes = observable({ hourSubTypes: [ new AirportHoursTypeModel() ] });
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ loadAirportHoursRemarks(), _airportSettingsStore.loadAirportHourSubTypes() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: ([ airportHoursRemarks ]) => {
          gridState.setGridData(airportHoursRemarks);
        },
        error: (error: AxiosError) => Logger.error(error.message),
      });
  };

  /* istanbul ignore next */
  const loadAirportHoursRemarks = (): Observable<AirportHourRemarksModel[]> => {
    return forkJoin([
      _airportSettingsStore.getAirportHoursRemarks(),
      _airportSettingsStore.loadAirportHourTypes(),
    ]).pipe(
      map(([ airportHoursRemarks, airportHourTypes ]) =>
        airportHoursRemarks.map(
          (remark: AirportHourRemarksModel) =>
            new AirportHourRemarksModel({
              ...remark,
              airportHoursType: new AirportHoursTypeModel(
                airportHourTypes.find(({ id }) => id === remark.airportHoursSubType.airportHoursType.id)
              ),
            })
        )
      )
    );
  };

  const addNewType = () => {
    agGrid.addNewItems([ new AirportHourRemarksModel() ], { startEditing: false, colKey: 'airportHoursType' });
    gridState.setHasError(true);
  };

  const setAirportHoursSubTypes = (airportHoursId: number): void => {
    airportHourSubTypes.hourSubTypes = _airportSettingsStore.airportHourSubTypes.filter(({ airportHoursType }) =>
      Utilities.isEqual(airportHoursType.id, airportHoursId)
    );
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Called from Ag Grid Component
  const onDropDownChange = ({ colDef }: ICellEditorParams, value: ISelectOption): void => {
    if (colDef.field === 'airportHoursType') {
      const selectedHoursType: AirportHoursTypeModel = value as AirportHoursTypeModel;
      const hourTypeId: number = agGrid.getInstanceValue<AirportHoursSubTypeModel>('airportHoursSubType')
        ?.airportHoursType?.id;
      airportHourSubTypes.hourSubTypes = [];

      if (hourTypeId !== selectedHoursType?.id) {
        agGrid.getComponentInstance('airportHoursSubType').setValue(null);
      }

      if (Boolean(selectedHoursType?.id)) {
        setAirportHoursSubTypes(selectedHoursType.id);
      }
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const isAlreadyExists = (id: number, rowIndex: number): boolean => {
    const isSequenceIdExists = agGrid._isAlreadyExists(
      [ 'sequenceId', 'airportHoursType', 'airportHoursSubType' ],
      id,
      rowIndex
    );
    if (isSequenceIdExists) {
      agGrid.showAlert('Sequence Id should be unique.', 'airportHourSubTypeAlertMessageId');
      return true;
    }
    const isNameExists = agGrid._isAlreadyExists([ 'airportHoursType', 'airportHoursSubType', 'name' ], id, rowIndex);
    if (isNameExists) {
      agGrid.showAlert('Name should be unique.', 'airportHourSubTypeAlertMessageId');
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertAirportHourRemarks = (rowIndex: number): void => {
    const model: AirportHourRemarksModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id, rowIndex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .upsertAirportHourRemark(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportHourRemarksModel) => {
          agGrid._updateTableItem(rowIndex, response);
          if (Array.isArray(gridState.sortFilters) && gridState.sortFilters.length) {
            gridState.setGridData(Utilities.customArraySort(gridState.data, gridState.sortFilters[0].colId));
          }
          gridState.setGridData(Utilities.customArraySort(gridState.data, 'airportHoursSubType.name', 'sequenceId'));
        },
        error: (error: AxiosError) => {
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
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAirportHourRemarks(rowIndex);
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
      headerName: 'Hour Type',
      field: 'airportHoursType',
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursTypeModel, next: AirportHoursTypeModel) => {
        return Utilities.customComparator(current, next, 'name');
      },
      valueFormatter: ({ value }: ValueFormatterParams) => value.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Hour Type',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
        getAutoCompleteOptions: () => _airportSettingsStore.airportHourTypes,
      },
    },
    {
      headerName: 'Hour Sub Type',
      field: 'airportHoursSubType',
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursSubTypeModel, next: AirportHoursSubTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Hour Sub Type',
        getAutoCompleteOptions: () => airportHourSubTypes.hourSubTypes,
      },
    },
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
      context: { onDropDownChange, onInputChange },
      columnDefs: columnDefs,
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        gridState.setHasError(true);
        agGrid.startEditingRow(params);
        const selectedHoursType: number = params.data.airportHoursType?.id;
        if (Boolean(selectedHoursType)) {
          setAirportHoursSubTypes(selectedHoursType);
        }
      },
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, name, airportHoursType, airportHoursSubType } = node.data as AirportHourRemarksModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRPORT_HOUR_REMARKS_FILTERS.NAME]: name,
              [AIRPORT_HOUR_REMARKS_FILTERS.TYPE]: airportHoursType.name,
              [AIRPORT_HOUR_REMARKS_FILTERS.SUBTYPE]: airportHoursSubType.name,
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
        Add Airport Hour Remark
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[
          agGridUtilities.createSelectOption(AIRPORT_HOUR_REMARKS_FILTERS, AIRPORT_HOUR_REMARKS_FILTERS.NAME),
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

export default inject('airportSettingsStore')(observer(AirportHourSubType));
