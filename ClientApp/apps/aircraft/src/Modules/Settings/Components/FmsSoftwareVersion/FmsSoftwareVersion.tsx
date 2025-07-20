import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import {
  AvionicsSettingsStore,
  FmsModel,
  FmsSoftwareVersionModel,
  AVIONICS_SOFTWARE_VERSION_FILTERS,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { forkJoin } from 'rxjs';

interface Props {
  avionicsSettingsStore?: AvionicsSettingsStore;
}

const FmsSoftwareVersion: FC<Props> = ({ avionicsSettingsStore }) => {
  const alertMessageId: string = 'FmsSoftwareAlertMessage';
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AVIONICS_SOFTWARE_VERSION_FILTERS, FmsSoftwareVersionModel>([], gridState);
  const _avionicsSettingsStore = avionicsSettingsStore as AvionicsSettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _avionicsSettingsStore.getFmsSoftwareVersions(), _avionicsSettingsStore.getFmsModels() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ fmsSoftwareVersions ]) => gridState.setGridData(fmsSoftwareVersions));
  };

  const addNewType = () => {
    agGrid.addNewItems(
      [
        new FmsSoftwareVersionModel({
          id: 0,
        }),
      ],
      {
        startEditing: false,
        colKey: 'name',
      }
    );
    gridState.setHasError(true);
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', alertMessageId);
      return true;
    }
    return false;
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
        upsertFmsSoftwareVersion(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const upsertFmsSoftwareVersion = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _avionicsSettingsStore
      .upsertFmsSoftwareVersion(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: FmsSoftwareVersionModel) => {
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
      headerName: 'Model',
      field: 'fmsModel',
      cellEditor: 'customAutoComplete',
      comparator: (current: FmsModel, next: FmsModel) => Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'FMS Model',
        getAutoCompleteOptions: () => _avionicsSettingsStore.fmsModels,
        valueGetter: (option: FmsModel) => option,
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
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
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
        const { id, name, fmsModel } = node.data as FmsSoftwareVersionModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AVIONICS_SOFTWARE_VERSION_FILTERS.NAME]: name,
              [AVIONICS_SOFTWARE_VERSION_FILTERS.MODEL]: fmsModel.name,
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
        Add FMS Software Version
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[
          agGridUtilities.createSelectOption(AVIONICS_SOFTWARE_VERSION_FILTERS, AVIONICS_SOFTWARE_VERSION_FILTERS.NAME),
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

export default inject('avionicsSettingsStore')(observer(FmsSoftwareVersion));
