import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { SettingsStore, useRestrictionModuleSecurity, UWAAllowableActionModel } from '../../../Shared';
import { Logger } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { UIStore, Utilities, GRID_ACTIONS, NAME_TYPE_FILTERS, ViewPermission } from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ColDef, GridOptions, ICellRendererParams, RowNode } from 'ag-grid-community';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { finalize, takeUntil } from 'rxjs/operators';
import { useSearchHeader, SearchHeaderV3 } from '@wings-shared/form-controls';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';

interface Props extends Partial<ICellRendererParams> {
  settingsStore?: SettingsStore;
}

const UWAAllowableAction: FC<Props> = observer(({ settingsStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<NAME_TYPE_FILTERS, UWAAllowableActionModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const _settingsStore = settingsStore as SettingsStore;

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getUWAAllowableActions()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(uwaAllowableActions => gridState.setGridData(uwaAllowableActions));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', 'NameSettingsUnique');
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertUWAAllowableAction = (rowIndex: number): void => {
    const rowData = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(rowData.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertUWAAllowableAction(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: UWAAllowableActionModel) => {
          agGrid._updateTableItem(rowIndex, response);
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
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
        upsertUWAAllowableAction(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const getEditableState = ({ data }: RowNode): boolean => {
    return !Boolean(data.id);
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
      editable: ({ node }) => getEditableState(node),
    },
    {
      headerName: 'Services Editable',
      field: 'isEditable',
      cellEditor: 'checkBoxRenderer',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
    },
    {
      headerName: 'Summary Description',
      field: 'summaryDescription',
      cellEditorParams: {
        isRequired: false,
        rules: 'string|between:0,1000',
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          cellRenderer: 'actionRenderer',
          cellEditor: 'actionRenderer',
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)) },
      columnDefs,
      isEditable: restrictionModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const { name, id } = node.data;
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
      onRowEditingStopped: () => agGrid.onRowEditingStopped(),
    };
  };

  /* istanbul ignore next */
  const addNewType = () => {
    agGrid.addNewItems([ new UWAAllowableActionModel({ id: 0 }) ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={restrictionModuleSecurity.isSettingsEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addNewType}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
        >
          Add UWA Allowable Action
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(NAME_TYPE_FILTERS, NAME_TYPE_FILTERS.NAME) ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
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
});

export default inject('settingsStore')(UWAAllowableAction);
