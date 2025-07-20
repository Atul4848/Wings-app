import React, { FC, ReactNode, useEffect, useState } from 'react';
import {
  ColDef,
  GridOptions,
  SortChangedEvent,
  ICellEditorParams,
  RowNode,
  ValueFormatterParams,
} from 'ag-grid-community';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ModelStatusOptions } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AirportSettingsStore, ICAOCodeModel, ICAO_CODE_FILTER, useAirportModuleSecurity } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { icaoGridFilters } from './fields';
import ICAOAuditHistory from './ICAOAuditHistory/ICAOAuditHistoryV2';
import {
  DATE_FORMAT,
  GridPagination,
  IAPIGridRequest,
  ISelectOption,
  UIStore,
  Utilities,
  regex,
  ViewPermission,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe, useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const ICAOCode: FC<Props> = ({ airportSettingsStore }) => {
  const [ active, setActive ] = useState(false);
  const [ inactive, setInactive ] = useState(false);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<ICAO_CODE_FILTER, ICAOCodeModel>(icaoGridFilters, gridState);
  const _useConfirmDialog = useConfirmDialog();
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();
  const filter = active ? 'Active' : inactive ? 'InActive' : '';

  /* istanbul ignore next */
  useEffect(() => {
    loadICAOCodes();
  }, [ filter ]);

  /* istanbul ignore next */
  const _statusFilter = (): IAPIGridRequest | null => {
    // in all no filter required
    if ((active && inactive) || !filter) {
      return null;
    }
    return {
      filterCollection: JSON.stringify([ Utilities.getFilter('Status.Name', filter) ]),
    };
  };

  const loadICAOCodes = (pageRequest?: IAPIGridRequest) => {
    const { searchValue, selectInputsValues } = searchHeader.getFilters()
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ..._statusFilter(),
      ...agGrid.filtersApi.getSearchFilters(
        searchValue || '',
        selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
    };
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .loadICAOCodes(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
      });
  };

  const validateICAOCodes = (model: ICAOCodeModel, searchValue: string) => {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageSize: 0,
      searchCollection: JSON.stringify([ Utilities.getFilter('Code', searchValue) ]),
    };
    return _airportSettingsStore
      .loadICAOCodes(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(({ results }) => {
        const hasError = results.some(item => item.id !== model?.id && Utilities.isEqual(searchValue, item.code));
        gridState.setHasError(hasError);
        agGrid.getComponentInstance('code').setCustomError(hasError ? 'ICAO code should be unique' : '');
      });
  };

  const addNewType = () => {
    agGrid.addNewItems([ new ICAOCodeModel() ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    agGrid.getComponentInstance('code').setCustomError('');
    // search for duplicate ICAO
    if (value.length === 4) {
      validateICAOCodes(params.data, value);
      return;
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        const _model = agGrid._getTableItem(rowIndex);
        gridState.gridApi.stopEditing();
        upsertICAOCode(_model, rowIndex);
        break;
      case GRID_ACTIONS.TOGGLE_STATUS:
        updateIcaoStatus(rowIndex);
        break;
      case GRID_ACTIONS.AUDIT:
        const model = agGrid._getTableItem(rowIndex);
        ModalStore.open(<ICAOAuditHistory icaoCode={model.code} airportSettingsStore={_airportSettingsStore} />);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const upsertICAOCode = (model: ICAOCodeModel, rowIndex: number): void => {
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .upsertICAOCode(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => agGrid._updateTableItem(rowIndex, response),
        error: error => agGrid.showAlert(error.message, 'upsertIcao'),
      });
  };

  /* istanbul ignore next */
  const updateIcaoStatus = (rowIndex: number): void => {
    const _model = agGrid._getTableItem(rowIndex);
    const status = Utilities.isEqual(_model.status?.name || '', 'Active') ? 'Deactivate' : 'Activate';
    _useConfirmDialog.confirmAction(
      () => {
        const _status = ModelStatusOptions.find(x => !Utilities.isEqual(x.name, _model.status?.name || ''));
        _model.status = _status;
        upsertICAOCode(_model, rowIndex);
        ModalStore.close();
      },
      {
        message: `Are you sure you want to ${status} this ICAO?`,
        title: `Confirm ${status}`,
      }
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'ICAO',
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
        isActionMenu: true,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        getVisibleState: ({ data }: RowNode) =>
          Boolean(Utilities.isEqual(data.status?.name, 'InActive') || !data.airportId),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'History',
            action: GRID_ACTIONS.AUDIT,
            isHidden: !Boolean(Utilities.isEqual(data.status?.name, 'InActive') && data.airportId),
          },
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
      isExternalFilterPresent: () => false,
      suppressClickEdit: !gridState.isRowEditing,
      pagination: false,
      onSortChanged: (e: SortChangedEvent) => {
        agGrid.filtersApi.onSortChanged(e);
        loadICAOCodes();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <div>
        <FormControlLabel
          label="Active"
          control={
            <Checkbox
              name="icao-status"
              checked={active}
              disabled={gridState.isRowEditing || UIStore.pageLoading}
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
              name="icao-status"
              checked={inactive}
              disabled={gridState.isRowEditing || UIStore.pageLoading}
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
            onClick={addNewType}
          >
            Add Official ICAO Code
          </PrimaryButton>
        </ViewPermission>
      </div>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[ agGridUtilities.createSelectOption(ICAO_CODE_FILTER, ICAO_CODE_FILTER.ICAO) ]}
        onFiltersChanged={loadICAOCodes}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => loadICAOCodes()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadICAOCodes}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('airportSettingsStore')(observer(ICAOCode));
