import React, { FC } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './OptionFieldGrid.style';
import { SettingOptionsModel, UVGO_SETTING } from '../../../Shared';
import { IClasses, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { ChildGridWrapper, ConfirmDialog } from '@wings-shared/layout';

interface Props {
  classes?: IClasses;
  optionsField: SettingOptionsModel[];
  openOptionFieldDialog: (optionsField: SettingOptionsModel, viewMode: VIEW_MODE) => void;
  upsertOptionField: (optionsField: SettingOptionsModel) => void;
  deleteOptionField: (id: number) => void;
}

const OptionFieldGrid: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<UVGO_SETTING, SettingOptionsModel>([], gridState);
  const classes = useStyles();

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        const data: SettingOptionsModel = agGrid._getTableItem(rowIndex);
        props.openOptionFieldDialog(data, VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
        agGrid.cancelEditing(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveOptionField(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        break;
    }
  }

  const confirmRemoveOptionField = (rowIndex: number): void => {
    const data: SettingOptionsModel = agGrid._getTableItem(rowIndex);
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this option?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => props.deleteOptionField(data.id)}
      />
    );
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Key',
      field: 'keyName',
    },
    {
      headerName: 'Value',
      field: 'value',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.value || value
      },
    },
    {
      headerName: 'Type',
      field: 'type',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.value || ''
      },
    },
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 130,
      minWidth: 130,
      sortable: false,
      filter: false,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          {
            title: 'Edit',
            isHidden: false,
            action: GRID_ACTIONS.EDIT,
          },
          {
            title: 'Delete',
            action: GRID_ACTIONS.DELETE,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    },
  ];

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: this,
        columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: true,
          getDisabledState: () => gridState.hasError,
          getEditableState: () => false,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        },
      }),
      isExternalFilterPresent: () => false,
      doesExternalFilterPass: node => false,
    };
  }

  return (
    <div className={classes.container}>
      <ChildGridWrapper
        onAdd={() => props.openOptionFieldDialog(new SettingOptionsModel(), VIEW_MODE.NEW)}
        hasAddPermission={true}
        disabled={gridState.isProcessing || props.optionsField.length > 19}
      >
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={props.optionsField}
          gridOptions={gridOptions()}
        />
      </ChildGridWrapper>
    </div>
  );
}

export default (observer(OptionFieldGrid));
