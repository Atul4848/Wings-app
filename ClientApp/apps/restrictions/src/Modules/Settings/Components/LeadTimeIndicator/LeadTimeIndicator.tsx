import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SettingsStore, useRestrictionModuleSecurity } from '../../../Shared';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, NAME_TYPE_FILTERS, IdNameCodeModel, GRID_ACTIONS } from '@wings-shared/core';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  AgGridActions,
  useAgGrid,
  useGridState,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  settingsStore?: SettingsStore;
  isEditable?: boolean;
}

const LeadTimeIndicator: FC<Props> = ({ isEditable = true, ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<NAME_TYPE_FILTERS, IdNameCodeModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const alertMessageId: string = 'leadTimeIndicatorAlert';
  const _settingsStore = props.settingsStore as SettingsStore;

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getLeadTimeIndicators()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(leadTimeIndicators => gridState.setGridData(leadTimeIndicators));
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        ignoreNumber: true,
        rules: 'required|string|between:1,50',
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        isRequired: true,
        ignoreNumber: true,
        rules: 'required|string|between:1,1',
      },
    },
    { ...agGrid.actionColumn({ headerName: '' }) },
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
      suppressClickEdit: !isEditable || !restrictionModuleSecurity.isSettingsEditable,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
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
        agGrid.setColumnVisible('actionRenderer', isEditable);
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
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
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', alertMessageId);
      return true;
    }
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
        upsertLeadTimeIndicator(rowIndex);
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
        Add Lead Time Indicator
      </PrimaryButton>
    );
  };

  const upsertLeadTimeIndicator = (rowIndex: number) => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertLeadTimeIndicator(model)
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

export default inject('settingsStore')(observer(LeadTimeIndicator));
