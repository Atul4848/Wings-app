import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { observer, inject } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import {
  AIRPORT_CODE_SETTING_FILTERS,
  AirportCodeSettingsModel,
  AirportSettingsStore,
  useAirportModuleSecurity
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Observable } from 'rxjs';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AlertStore } from '@uvgo-shared/alert';

interface Props {
  type: string;
  codeLength?: number;
  getSettings?: () => Observable<AirportCodeSettingsModel[]>;
  upsertSettings?: (object: AirportCodeSettingsModel) => Observable<AirportCodeSettingsModel>;
  airportSettingsStore?: AirportSettingsStore;
}

const AirportCodeSettings: FC<Props> = ({ codeLength = 3, type, airportSettingsStore, ...props }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_CODE_SETTING_FILTERS, AirportCodeSettingsModel>([], gridState);
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    props.getSettings &&
      props
        .getSettings()
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: AirportCodeSettingsModel[]) => gridState.setGridData(response));
  };

  const upsertSettings = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    props.upsertSettings &&
      props
        .upsertSettings(model)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: AirportCodeSettingsModel) => agGrid._updateTableItem(rowIndex, response),
          error: (error: AxiosError) => AlertStore.critical(error.message),
        });
  };

  const addNewType = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    const airportCode = new AirportCodeSettingsModel({ id: 0 });
    agGrid.addNewItems([ airportCode ], { startEditing: false, colKey: 'code' });
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
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertSettings(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        ignoreNumber: true,
        rules: `required|string|between:1,${codeLength}`,
        isUnique: (value: string) => {
          return !gridState.data.some(({ code }) => Utilities.isEqual(code, value?.trim()));
        },
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      hide: true,
      minWidth: 150,
      maxWidth: 210,
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
        getEditableState: node => !Boolean(node.id),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
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
        const { id, code } = node.data as AirportCodeSettingsModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRPORT_CODE_SETTING_FILTERS.CODE]: code,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('actionRenderer', false);
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
        Add {type}
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[
          agGridUtilities.createSelectOption(AIRPORT_CODE_SETTING_FILTERS, AIRPORT_CODE_SETTING_FILTERS.CODE),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('airportSettingsStore')(observer(AirportCodeSettings));
