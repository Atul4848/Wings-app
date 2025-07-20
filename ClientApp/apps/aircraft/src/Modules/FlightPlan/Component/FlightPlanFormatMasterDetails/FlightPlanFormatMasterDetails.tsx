import React, { FC, ReactNode, useEffect } from 'react';
import { Utilities, ENTITY_STATE, IClasses, GRID_ACTIONS, UIStore } from '@wings-shared/core';
import {
  ColDef,
  GridOptions,
  ICellEditorParams,
  RowNode,
  RowEditingStartedEvent,
  GridReadyEvent,
} from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { FLIGHT_PLAN_FILTERS, FlightPlanFormatAccountModel, useAircraftModuleSecurity } from '../../../Shared';
import { useStyles } from './FlightPlanFormatMasterDetails.style';
import { Chip } from '@material-ui/core';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog } from '@wings-shared/hooks';
import { observer } from 'mobx-react';

interface Props {
  isEditable: boolean;
  flightPlanFormatAccounts: FlightPlanFormatAccountModel[];
  onDataSave: (response: FlightPlanFormatAccountModel[]) => void;
  onRowEditing: (isEditing: boolean) => void;
}

const FlightPlanFormatMasterDetails: FC<Props> = ({ ...props }) => {
  const alertMessageId: string = 'FlightPlanFormatMasterDetailsAlert';
  const gridState = useGridState();
  const classes = useStyles();
  const agGrid = useAgGrid<FLIGHT_PLAN_FILTERS, FlightPlanFormatAccountModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => agGrid.setColumnVisible('actionRenderer', props.isEditable), [ props.isEditable ]);

  const hasInValidRegistry = (registriesName: string): boolean => {
    const regList = registriesName.split(';').map(r => r.trim().toLowerCase());
    return regList.some((registry, index, array) => array.indexOf(registry) !== index || registry.length > 100);
  };

  // Called from Ag Grid Component
  const onInputChange = ({ colDef }: ICellEditorParams, value: string): void => {
    if (Utilities.isEqual(colDef.field || '', 'registriesName')) {
      const _hasInValidRegistry = hasInValidRegistry(value);
      if (_hasInValidRegistry) {
        agGrid
          .getComponentInstance(colDef.field || '')
          .setCustomError('Registries should be unique with maximum length 100');
      }
    }
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
        upsertFlightPlanFormatAccount(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        cancelEditing(rowIndex);
        props.onRowEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveAccount(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        props.onRowEditing(false);
        break;
    }
  };

  const addNewAccount = (): void => {
    const formatAccount = new FlightPlanFormatAccountModel({
      id: 0,
      tempId: Utilities.getTempId(true),
    });
    agGrid.addNewItems([ formatAccount ], { startEditing: false, colKey: 'accountNumber' });
    agGrid.setColumnVisible('actionRenderer', true);
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const confirmRemoveAccount = (rowIndex: number): void => {
    const model: FlightPlanFormatAccountModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteFlightPlanFormatAccount(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteFlightPlanFormatAccount(model), {
      title: 'Confirm Delete',
      message: 'Are you sure you want to remove this Account?',
    });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Account',
      field: 'accountNumber',
      cellEditorParams: {
        rules: 'required|string|between:1,5',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Registries',
      field: 'registriesName',
      cellRenderer: 'viewRenderer',
      cellEditorParams: {
        ignoreNumber: true,
      },
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.registriesName),
      },
    },
    {
      ...agGrid.actionColumn({
        maxWidth: 130,
        minWidth: 130,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: aircraftModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => props.isEditable,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!props.isEditable) {
          return;
        }
        agGrid._startEditingCell(Number(rowIndex), colDef.field || '');
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.startEditingRow(event);
        props.onRowEditing(true);
      },
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
      },
    };
  };

  const viewRenderer = (registries: string, getTagProps?: AutocompleteGetTagProps): ReactNode => {
    return registries
      .split(';')
      .filter(a => a.trim().length)
      .map((registries: string, index) => (
        <Chip
          classes={{ root: classes?.chip }}
          key={index}
          label={registries.toUpperCase()}
          {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
        />
      ));
  };

  /* istanbul ignore next */
  const upsertFlightPlanFormatAccount = (rowIndex: number): void => {
    const { flightPlanFormatAccounts, onRowEditing } = props;
    gridState.setGridData([ ...flightPlanFormatAccounts ]);
    const data: FlightPlanFormatAccountModel = agGrid._getTableItem(rowIndex);
    if (hasValidRowData(data, rowIndex)) {
      return;
    }
    onRowEditing(false);
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const cancelEditing = (rowIndex: number): void => {
    const data: FlightPlanFormatAccountModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data?.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  /* istanbul ignore next */
  const deleteFlightPlanFormatAccount = (model: FlightPlanFormatAccountModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    const _data = agGrid._getAllTableRows().map(
      requirement =>
        new FlightPlanFormatAccountModel({
          ...requirement,
          id: requirement.id || Utilities.getTempId(true),
          entityState: ENTITY_STATE.NEW,
          accountNumber: requirement.accountNumber.padStart(5, '0'),
        })
    );
    gridState.setGridData(_data);
    props.onDataSave(gridState.data);
  };

  const hasValidRowData = (data: FlightPlanFormatAccountModel, rowIndex: number): boolean => {
    const value = agGrid.getCellEditorInstance('accountNumber').getValue();
    const isExists = gridState.data.some(
      account => Utilities.isEqual(account.accountNumber, value.padStart(5, '0')) && !account.isSameData(data)
    );
    if (isExists) {
      agGrid.showAlert('Account should be unique.', alertMessageId);
      return isExists;
    }
    return false;
  };

  return (
    <div className={classes.root}>
      <CollapsibleWithButton
        title="Account"
        buttonText="Add Account"
        isButtonDisabled={
          gridState.isRowEditing || UIStore.pageLoading || !(aircraftModuleSecurity.isEditable && props.isEditable)
        }
        onButtonClick={addNewAccount}
      >
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={props.flightPlanFormatAccounts}
            gridOptions={gridOptions()}
            disablePagination={gridState.isRowEditing}
          />
        </ChildGridWrapper>
      </CollapsibleWithButton>
    </div>
  );
};

export default observer(FlightPlanFormatMasterDetails);
