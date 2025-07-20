import React, { FC, useEffect } from 'react';
import { ICellRendererParams, GridOptions, ColDef, ValueFormatterParams } from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  MODEL_STATUS,
  StatusTypeModel,
  IdNameCodeModel,
  getStringToYesNoNull,
  getYesNoNullToBoolean,
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  ENTITY_STATE,
} from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { AirframeRegistryModel, AirframeStore, SettingsStore, useAircraftModuleSecurity } from '../../../Shared';
import { useStyles } from './AirframeEditor.style';
import { BaseCustomerStore, ModelStatusOptions } from '@wings/shared';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { IPagination } from '@wings-shared/form-controls';
import { takeUntil, finalize } from 'rxjs/operators';
import { useParams } from 'react-router';
import { observable } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props extends Partial<ICellRendererParams> {
  isEditable?: boolean;
  airframeRegistries: AirframeRegistryModel[];
  onDataSave?: (response: AirframeRegistryModel[]) => void;
  onRowEditing: (isEditing: boolean) => void;
  customerStore?: BaseCustomerStore;
  airframeStore?: AirframeStore;
  settingsStore?: SettingsStore;
}

const AirframeRegistryGrid: FC<Props> = ({
  isEditable,
  onDataSave,
  onRowEditing,
  customerStore,
  airframeStore,
  settingsStore,
  airframeRegistries,
}: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', AirframeRegistryModel>([], gridState);
  const aircraftModuleSecurity = useAircraftModuleSecurity();
  const _useConfirmDialog = useConfirmDialog();
  const _customerStore = customerStore as BaseCustomerStore;
  const _airframeStore = airframeStore as AirframeStore;
  const _settingsStore = settingsStore as SettingsStore;
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const _observable = observable({ registryNationalities: [], registries: [] });

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, [ airframeRegistries ]);

  /* istanbul ignore next */
  const loadInitialData = () => {
    gridState.setGridData(airframeRegistries || []);
  };

  const addAirframeRegistry = (): void => {
    const activeRegistry = gridState.data.find(data => data.status.label === 'Active');

    if (activeRegistry) {
      _useConfirmDialog.confirmAction(
        () => {
          const rowIndex = gridState.data.findIndex(data => data.id === activeRegistry.id);
          if (rowIndex !== -1) {
            agGrid._updateTableItem(
              rowIndex,
              new AirframeRegistryModel({
                ...activeRegistry,
                status: new StatusTypeModel({ name: 'InActive', id: MODEL_STATUS.IN_ACTIVE }),
              })
            );
          }
          const newActiveRegistry = new AirframeRegistryModel({
            id: 0,
            status: new StatusTypeModel({ name: 'Active', id: MODEL_STATUS.ACTIVE }),
          });

          setTimeout(() => {
            agGrid.addNewItems([ newActiveRegistry ], { startEditing: false, colKey: 'registry' });
            gridState.setHasError(false); // Reset errors
          }, 100);
          ModalStore.close();
        },
        {
          title: 'Add Registry',
          message: 'Do you want to Inactivate the Active Registry record?',
          onNo: () => {
            // On No: Add a new inactive registry
            const airframeRegistryModel = new AirframeRegistryModel({
              id: 0,
              status: new StatusTypeModel({ name: 'InActive', id: MODEL_STATUS.IN_ACTIVE }),
            });
            agGrid.addNewItems([ airframeRegistryModel ], { startEditing: false, colKey: 'registry' });
            gridState.setHasError(true);
            ModalStore.close();
          },
        }
      );
      return;
    }

    // If no active registry exists, just add a new inactive registry
    const airframeRegistryModel = new AirframeRegistryModel({
      id: 0,
      status: new StatusTypeModel({ name: 'Active', id: MODEL_STATUS.ACTIVE }),
    });
    agGrid.addNewItems([ airframeRegistryModel ], { startEditing: false, colKey: 'registry' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const isAlreadyExists = (id: number): boolean => {
    const editorInstance = gridState.gridApi.getCellEditorInstances({ columns: [ 'registry' ] });
    const value = editorInstance[0].getValue();

    const isDuplicateData = gridState.data?.some(x => {
      const isSameRegistry = Utilities.isEqual(x.registry?.name, value.name);
      const isDifferentId = x.id !== id;
      return isSameRegistry && isDifferentId;
    });

    if (isDuplicateData) {
      agGrid.showAlert('Registry should be unique.', 'AirframeRegistry');
      return true;
    }
    return false;
  };

  const updateTableData = (rowIndex): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const _data = agGrid._getAllTableRows().map(
      registry =>
        new AirframeRegistryModel({
          ...registry,
          id: registry.id || Utilities.getTempId(true),
          entityState: ENTITY_STATE.NEW,
        })
    );
    gridState.setGridData(_data);
    onDataSave(_data);
  };

  const upsertRegistry = (rowIndex: number): void => {
    updateTableData(rowIndex);
  };

  /* istanbul ignore next */
  const cancelEditing = (rowIndex: number): void => {
    const data: AirframeRegistryModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data?.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
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
        upsertRegistry(rowIndex);
        onRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        cancelEditing(rowIndex);
        onRowEditing(false);
        break;
    }
  };
  const onSearchRegistry = (searchValue: string, pagination?: IPagination) => {
    if (searchValue.length < 2) return;
    const request = {
      pageSize: 0,
      searchCollection: JSON.stringify([{ propertyName: 'Name', propertyValue: searchValue, searchType: 'start' }]),
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getRegistriesNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const { results } = response;
        response.results = [];
        const filteredNotAssociatedRegistries = results
          .filter(reg => reg.status?.name === 'Active') // Only keep active registries
          ?.filter(
            reg =>
              !_airframeStore.airframes.some(
                x => x.airframeRegistries?.some(r => r.registry?.name === reg.name) && x.id !== Number(params?.id)
              )
          );

        _observable.registries = filteredNotAssociatedRegistries;
      });
  };

  const onSearchRegistryNationality = (searchValue: string) => {
    if (searchValue.length < 2) return;
    const request = {
      searchCollection: JSON.stringify([{ propertyName: 'CommonName', propertyValue: searchValue }]),
    };
    UIStore.setPageLoader(true);
    _settingsStore
      ?.getCountries(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const options = response.results.map(
          country => new IdNameCodeModel({ id: country.id, name: country.commonName, code: country.isO2Code })
        );
        _observable.registryNationalities = options;
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Registry',
      field: 'registry',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeholder: 'Select Registry',
        onSearch: onSearchRegistry,
        getAutoCompleteOptions: () => _observable.registries,
      },
    },
    {
      headerName: 'Registration Nationality',
      field: 'registrationNationality',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellEditorParams: {
        isRequired: true,
        onSearch: onSearchRegistryNationality,
        getAutoCompleteOptions: () => _observable.registryNationalities,
        valueGetter: (option: IdNameCodeModel) => option,
      },
    },
    {
      headerName: 'Carrier Code',
      field: 'carrierCode',
      cellEditorParams: {
        rules: 'string|between:0,4',
      },
    },
    {
      headerName: 'Out Off On IN',
      field: 'isOutOffOnIn',
      cellEditor: 'customSelect',
      valueFormatter: ({ value }) => getStringToYesNoNull(value?.label || value),
      cellEditorParams: {
        placeHolder: '',
        isBoolean: true,
        formatValue: value => getYesNoNullToBoolean(value?.label ?? value),
      },
    },
    {
      headerName: 'Call Sign',
      field: 'callSign',
      cellEditorParams: {
        rules: 'string|between:0,8',
      },
    },

    {
      headerName: 'Flight Aware Tracking',
      field: 'isFlightAwareTracking',
      cellEditor: 'customSelect',
      valueFormatter: ({ value }) => getStringToYesNoNull(value?.label || value),
      cellEditorParams: {
        placeHolder: '',
        isBoolean: true,
        formatValue: value => getYesNoNullToBoolean(value?.label ?? value),
      },
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Start Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        maxDate: params => params?.data?.endDate,
      },
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
        placeHolder: 'End Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        minDate: params => params?.data?.startDate,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: option => option,
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: false,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onOptionChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        hideActionButtons: !isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      pagination: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressClickEdit: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        onRowEditing(true);
      },
    };
  };

  return (
    <div className={classes.gridRoot}>
      <AgGridMasterDetails
        addButtonTitle="Add Airframe Registry"
        onAddButtonClick={addAirframeRegistry}
        hasAddPermission={aircraftModuleSecurity.isEditable}
        disabled={!isEditable || gridState.hasError || gridState.isRowEditing || UIStore.pageLoading}
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact
          gridOptions={gridOptions()}
          rowData={gridState.data}
          isRowEditing={gridState.isRowEditing}
          classes={{ customHeight: classes.customHeight }}
        />
      </AgGridMasterDetails>
    </div>
  );
};

export default inject('airframeStore', 'customerStore', 'settingsStore')(observer(AirframeRegistryGrid));
