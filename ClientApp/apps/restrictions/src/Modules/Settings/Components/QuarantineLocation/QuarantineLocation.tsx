import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { GRID_ACTIONS, IdNameCodeModel, NAME_TYPE_FILTERS, UIStore, Utilities } from '@wings-shared/core';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Logger } from '@wings-shared/security';
import { ColDef, GridOptions } from 'ag-grid-community';
import { AxiosError } from 'axios';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import { HealthAuthStore, useRestrictionModuleSecurity } from '../../../Shared';

interface Props {
  healthAuthStore?: HealthAuthStore;
  isEditable?: boolean;
}

const QuarantineLocation: FC<Props> = ({ isEditable = true, ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<NAME_TYPE_FILTERS, IdNameCodeModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const alertMessageId: string = 'quarantineLocation';
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _healthAuthStore
      .getQuarantineLocations()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(quarantineLocations => gridState.setGridData(quarantineLocations));
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,50',
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|numeric',
      },
    },
    { ...agGrid.actionColumn({ headerName: '' }) }
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
      isEditable: restrictionModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      suppressClickEdit: !isEditable || !restrictionModuleSecurity.isSettingsEditable,
      doesExternalFilterPass: node => {
        const { id, name } = node.data as IdNameCodeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [NAME_TYPE_FILTERS.NAME]: name,
            },
            searchHeader.getFilters().searchValue || '',
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('actionRenderer', isEditable as boolean);
      },
    };
  };
  const addNewType = () => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new IdNameCodeModel({ id: 0 }) ], {
      startEditing: false,
      colKey: 'name',
    });
    gridState.setHasError(true);
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'code' ], id)) {
      agGrid.showAlert('Code should be unique.', alertMessageId);
      return true;
    }
    return false;
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertQuarantineLocation(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const rightContent = (): ReactNode => {
    if (!restrictionModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={gridState.isRowEditing} onClick={addNewType}>
        Add Quarantine Location
      </PrimaryButton>
    );
  };

  const upsertQuarantineLocation = (rowIndex: number) => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertQuarantineLocation(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: IdNameCodeModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(NAME_TYPE_FILTERS, NAME_TYPE_FILTERS.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
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

export default inject('healthAuthStore')(observer(QuarantineLocation));
