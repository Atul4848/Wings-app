import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditor } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import {
  SettingsStore,
  FUEL_RESERVE_POLICY_FILTER,
  FuelReservePolicyModel,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, IClasses } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Theme } from '@material-ui/core';

interface Props {
  classes?: IClasses;
  settingsStore?: SettingsStore;
  theme?: Theme;
}

const FuelReservePolicy: FC<Props> = ({ settingsStore }) => {
  const alertMessageId: string = 'FuelReservePolicyAlert';
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<FUEL_RESERVE_POLICY_FILTER, FuelReservePolicyModel>([], gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getFuelReservePolicies()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(fuelReservePolicies => gridState.setGridData(fuelReservePolicies));
  };

  const addNewType = () => {
    agGrid.addNewItems(
      [
        new FuelReservePolicyModel({
          id: 0,
        }),
      ],
      {
        startEditing: false,
        colKey: 'policyNumber',
      }
    );
    gridState.setHasError(true);
  };

  const isAlreadyExists = (id: number): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'policyNumber' ] });
    const value = editorInstance[0]?.getValue();

    const isDuplicateData = gridState.data.some(a => Utilities.isEqual(a.policyNumber, Number(value)) && id !== a.id);

    if (isDuplicateData) {
      AlertStore.critical(`Fuel Reserve Policy already exist for PolicyNumber: ${value}`);
    }
    return isDuplicateData;
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
        upsertFuelReservePolicy(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const _sortColumns = (rowIndex: number, item: FuelReservePolicyModel, sortColumn: string): void => {
    agGrid._updateTableItem(rowIndex, item);
    let sortedColoum = [ ...gridState.data ];
 
    if (sortColumn) {
      sortedColoum = sortedColoum.sort((a, b) => a[sortColumn] - b[sortColumn]);
      gridState.setGridData(sortedColoum);
    }
  };

  /* istanbul ignore next */
  const upsertFuelReservePolicy = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertFuelReservePolicy(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: FuelReservePolicyModel) => _sortColumns(rowIndex, response, 'policyNumber'),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Policy Number',
      field: 'policyNumber',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|numeric|digits_between:1,3',
      },
    },
    {
      headerName: 'Policy Description',
      field: 'policyDescription',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,250',
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
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: aircraftModuleSecurity.isSettingsEditable,
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
        const { policyDescription, policyNumber, id } = node.data as FuelReservePolicyModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [FUEL_RESERVE_POLICY_FILTER.DESCRIPTION]: policyDescription,
              [FUEL_RESERVE_POLICY_FILTER.NUMBER]: policyNumber.toString(),
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
        Add Fuel Reserve Policy
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[
          agGridUtilities.createSelectOption(FUEL_RESERVE_POLICY_FILTER, FUEL_RESERVE_POLICY_FILTER.NUMBER),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
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

export default inject('settingsStore')(observer(FuelReservePolicy));
