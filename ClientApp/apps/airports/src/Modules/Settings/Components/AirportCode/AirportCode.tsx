import React, { FC, useEffect, ReactNode, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { Observable, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams, RowNode, ICellEditorParams } from 'ag-grid-community';
import { ModelStatusOptions } from '@wings/shared';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { AlertStore } from '@uvgo-shared/alert';
import {
  GRID_ACTIONS,
  UIStore,
  Utilities,
  ISelectOption,
  GridPagination,
  IAPIGridRequest,
  ViewPermission,
  DATE_FORMAT,
  regex,
  cellStyle,
  MODEL_STATUS,
} from '@wings-shared/core';
import { useUnsubscribe, useConfirmDialog } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  AIRPORT_CODE_SETTING_FILTERS,
  AIRPORT_CODE_TYPES,
  AirportCodeSettingsModel,
  AirportSettingsStore,
  useAirportModuleSecurity,
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { gridFilters } from './fields';

interface Props {
  codeType: AIRPORT_CODE_TYPES;
  headerName: string;
  codeLength?: number;
  airportSettingsStore?: AirportSettingsStore;
  upsertSettings: (request: AirportCodeSettingsModel) => Observable<AirportCodeSettingsModel>;
}

const AirportCode: FC<Props> = ({ codeLength = 4, codeType, headerName, airportSettingsStore, ...props }: Props) => {
  const [ active, setActive ] = useState(false);
  const [ inactive, setInactive ] = useState(false);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_CODE_SETTING_FILTERS, AirportCodeSettingsModel>(gridFilters, gridState);
  const _useConfirmDialog = useConfirmDialog();
  const airportModuleSecurity = useAirportModuleSecurity();
  const _settingsStore = airportSettingsStore as AirportSettingsStore;
  const _status = active ? MODEL_STATUS.ACTIVE : inactive ? MODEL_STATUS.IN_ACTIVE : 0;

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, [ _status ]);

  /* istanbul ignore next */
  const getFilterCollection = (): IAPIGridRequest => {
    const _searchValue = searchHeader.getFilters().searchValue;

    if (!_status && !_searchValue) {
      return {};
    }

    if (_searchValue) {
      const _filters = _status ? [{ statusId: _status, code: _searchValue }] : [{ code: _searchValue }];
      return {
        filterCollection: JSON.stringify(_filters),
      };
    }

    return {
      filterCollection: JSON.stringify([{ statusId: _status }]),
    };
  };

  /* istanbul ignore next */
  const getSettingsAPI = (pageRequest: IAPIGridRequest, codeType: AIRPORT_CODE_TYPES) => {
    switch (codeType) {
      case AIRPORT_CODE_TYPES.ICAO_CODE:
        return _settingsStore.loadICAOCodes(pageRequest);
      case AIRPORT_CODE_TYPES.UWA_CODE:
        return _settingsStore.loadUwaCodes(pageRequest);
      case AIRPORT_CODE_TYPES.REGIONAL_CODE:
        return _settingsStore.loadRegionalCodes(pageRequest);
      default:
        return of<any>([]);
    }
  };

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...getFilterCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
    };
    UIStore.setPageLoader(true);
    getSettingsAPI(request, codeType)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
      });
  };

  /* istanbul ignore next */
  const upsertAirportCode = (rowIndex: number, codeModel: AirportCodeSettingsModel): void => {
    UIStore.setPageLoader(true);
    props
      .upsertSettings(codeModel)
      ?.pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const updateCodeStatus = (rowIndex: number): void => {
    const _model = agGrid._getTableItem(rowIndex);
    const _statusName = _model.status?.name || '';
    const status = Utilities.isEqual(_statusName, 'Active') ? 'Deactivate' : 'Activate';

    _useConfirmDialog.confirmAction(
      () => {
        const _status = ModelStatusOptions.find(x => !Utilities.isEqual(x.name, _statusName));
        _model.status = _status;
        upsertAirportCode(rowIndex, _model);
        ModalStore.close();
      },
      {
        message: `Are you sure you want to ${status} this ${codeType}?`,
        title: `Confirm ${status}`,
      }
    );
  };

  const validateAirportCodes = (model: AirportCodeSettingsModel, searchValue: string) => {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageSize: 0,
      filterCollection: JSON.stringify([{ code: searchValue }]),
    };
    return getSettingsAPI(request, codeType)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(({ results }) => {
        const hasError = results.some(item => item.id !== model?.id && Utilities.isEqual(searchValue, item.code));
        gridState.setHasError(hasError);
        agGrid.getComponentInstance('code').setCustomError(hasError ? `${codeType} should be unique` : '');
      });
  };

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    agGrid.getComponentInstance('code').setCustomError('');
    // search for duplicate code
    if (value.length === 4) {
      validateAirportCodes(params.data, value);
      return;
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, 'code');
        break;
      case GRID_ACTIONS.SAVE:
        const model = agGrid._getTableItem(rowIndex);
        gridState.gridApi.stopEditing();
        upsertAirportCode(rowIndex, model);
        break;
      case GRID_ACTIONS.TOGGLE_STATUS:
        updateCodeStatus(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const addNewCode = () => {
    agGrid.setColumnVisible('actionRenderer', true);
    const code = new AirportCodeSettingsModel({ id: 0 });
    agGrid.addNewItems([ code ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <div>
        <FormControlLabel
          label="Active"
          control={
            <Checkbox
              name="code-status"
              disabled={gridState.isRowEditing}
              checked={active}
              onChange={(e, checked: boolean) => {
                setActive(checked);
                setInactive(false);
                gridState.gridApi?.onFilterChanged();
              }}
            />
          }
        />
        <FormControlLabel
          label="Inactive"
          control={
            <Checkbox
              name="code-status"
              disabled={gridState.isRowEditing}
              checked={inactive}
              onChange={(e, checked: boolean) => {
                setInactive(checked);
                setActive(false);
                gridState.gridApi?.onFilterChanged();
              }}
            />
          }
        />
        <ViewPermission hasPermission={airportModuleSecurity.isSettingsEditable}>
          <PrimaryButton
            variant="contained"
            startIcon={<AddIcon />}
            disabled={gridState.isRowEditing || UIStore.pageLoading}
            onClick={addNewCode}
          >
            Add {codeType}
          </PrimaryButton>
        </ViewPermission>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: headerName,
      field: 'code',
      cellEditorParams: {
        isRequired: true,
        rules: `required|string|regex:${regex.alphaNumericWithoutSpaces}|size:4`,
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
      headerName: 'Status',
      field: 'status',
      editable: false,
      cellRenderer: 'statusRenderer',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value?.name || '',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
      hide: !gridState.isRowEditing,
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        isActionMenu: true,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        getVisibleState: ({ data }: RowNode) =>
          Boolean(Utilities.isEqual(data.status?.name, 'InActive') || !data.airportId),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        actionMenus: ({ data }: RowNode) => [
          {
            title: Boolean(Utilities.isEqual(data.status?.name, 'Active')) ? 'Deactivate' : 'Activate',
            action: GRID_ACTIONS.TOGGLE_STATUS,
            isHidden: Boolean(data.airportId),
          },
        ],
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      suppressClickEdit: true,
      isExternalFilterPresent: () => false,
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[]}
        onFiltersChanged={loadInitialData}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => loadInitialData()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
      />
    </>
  );
};

export default inject('airportSettingsStore')(observer(AirportCode));
