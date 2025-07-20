import React, { FC, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../PermissionGrid.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS, ISelectOption, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { AirportSettingsStore, PermissionToleranceModel, useAirportModuleSecurity } from '../../../../../Shared';
import { ColDef, GridOptions, ICellEditorParams, GridReadyEvent } from 'ag-grid-community';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  isEditable: boolean;
  tolerance: PermissionToleranceModel[];
  onGridDataUpdate: (gridName: string, gridData: PermissionToleranceModel[]) => void;
  isRowEditing: (isEditing: boolean) => void;
}

const PermissionTolerance: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const classes = useStyles();
  const agGrid = useAgGrid<'', PermissionToleranceModel>([], gridState);
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;
  const _disabled = gridState.isRowEditing || UIStore.pageLoading || !props.isEditable;
  const { isEditable } = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
    gridState.setGridData(props.tolerance);
  }, [ props.tolerance, props.isEditable ]);

  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const addTolerance = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new PermissionToleranceModel({ id: 0 }) ], {
      startEditing: false,
      colKey: 'permissionRequiredFors',
    });
    gridState.setHasError(true);
  };

  const updateTableData = (): void => {
    props.isRowEditing(false);
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    props.onGridDataUpdate('permissionTolerances', gridState.data);
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
        updateTableData();
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        props.isRowEditing(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Type',
      field: 'permissionRequiredFors',
      cellRenderer: 'agGridChipView',
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        isRequired: true,
        multiSelect: true,
        placeHolder: 'Select Type',
        limitTags: () => 1,
        getAutoCompleteOptions: () => _airportSettingStore.requiredFor,
      },
    },
    {
      headerName: 'Tolerance Minus',
      field: 'toleranceMinus',
      cellEditorParams: {
        rules: 'required|digits_between:1,3',
      },
    },
    {
      headerName: 'Tolerance Plus',
      field: 'tolerancePlus',
      cellEditorParams: {
        rules: 'required|digits_between:1,3',
      },
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
            },
          ],
          onAction: gridActions,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      suppressClickEdit: true,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        props.isRowEditing(true);
        _airportSettingStore?.loadRequiredFor().subscribe();
      },
    };
  };

  return (
    <>
      <div className={classes.addButtonContainer}>
        <ViewPermission hasPermission={props.isEditable}>
          <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={_disabled} onClick={addTolerance}>
            Add Tolerance
          </PrimaryButton>
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing}
          hidePagination={true}
        />
      </div>
    </>
  );
};

export default inject('airportSettingsStore')(observer(PermissionTolerance));
