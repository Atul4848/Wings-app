import React, { useEffect, FC } from 'react';
import { ColDef, GridOptions, RowNode, ICellEditorParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { AircraftOperatorSettings, NAME_DESCRIPTION_FILTERS, useRestrictionModuleSecurity } from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  aircraftOperatorSettingsStore?: AircraftOperatorSettings;
}

const RestrictionSeverity: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<NAME_DESCRIPTION_FILTERS, SettingsTypeModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const _aircraftOperatorSettingsStore = props.aircraftOperatorSettingsStore as AircraftOperatorSettings;

  /* istanbul ignore next */

  useEffect(() => {
    loadInitialData();
  }, []);

  const addNewType = () => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new SettingsTypeModel({ id: 0 }) ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const rightContent = () => {
    if (!restrictionModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={gridState.isRowEditing} onClick={addNewType}>
        Add Restriction Severity
      </PrimaryButton>
    );
  };

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _aircraftOperatorSettingsStore
      .getRestrictionSeverities()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(restrictionSeverities => gridState.setGridData(restrictionSeverities));
  };

  /* istanbul ignore next */
  const getEditableState = ({ data }: RowNode) => !Boolean(data.id);

  const isAlreadyExists = (id: number) => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', 'NameSettingsUnique');
      return true;
    }
    return false;
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
      headerName: 'Summary Description',
      field: 'summaryDescription',
      cellEditorParams: {
        isRequired: false,
        rules: 'string|between:0,1000',
      },
    },
    { ...agGrid.actionColumn({ headerName: '' }) },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
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
      suppressClickEdit: !restrictionModuleSecurity.isSettingsEditable,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const { name, id, summaryDescription } = node.data;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [NAME_DESCRIPTION_FILTERS.NAME]: name,
              [NAME_DESCRIPTION_FILTERS.SUMMARY_DESCRIPTION]: summaryDescription,
            },
            searchHeader.getFilters().searchValue || '',
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('actionRenderer', true);
      },
    };
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const upsertRestrictionSeverity = (rowIndex: number) => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _aircraftOperatorSettingsStore
      .upsertRestrictionSeverity(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: SettingsTypeModel) => {
          agGrid._updateTableItem(rowIndex, response);
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
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
        upsertRestrictionSeverity(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(NAME_DESCRIPTION_FILTERS, NAME_DESCRIPTION_FILTERS.NAME) ]}
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

export default inject('aircraftOperatorSettingsStore')(observer(RestrictionSeverity));
