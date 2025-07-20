import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, BaseGrid, AgGridActions, AgGridCheckBox } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles } from '@material-ui/core';
import { styles } from './FieldDefinitionGrid.style';
import { FieldDefinitionModel } from '../../../Shared';
import { IClasses, ISelectOption, Utilities, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { ChildGridWrapper, ConfirmDialog } from '@wings-shared/layout';

interface Props {
  classes?: IClasses;
  fieldDefinitions: FieldDefinitionModel[];
  openEventTypeFieldDialog: (fieldDefinition: FieldDefinitionModel, viewMode: VIEW_MODE) => void;
  upsertFieldDefinition: (fieldDefinition: FieldDefinitionModel) => void;
  deleteFieldDefinition: (id: number) => void;
}

@observer
class FieldDefinitionGrid extends BaseGrid<Props, FieldDefinitionModel> {
  constructor(props) {
    super(props);
  }

  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        const data: FieldDefinitionModel = this._getTableItem(rowIndex);
        this.props.openEventTypeFieldDialog(data, VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
        this._cancelEditing(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        this.confirmRemoveFieldDefinition(rowIndex);
        break;
      default:
        this.gridApi.stopEditing(true);
        break;
    }
  }

  private confirmRemoveFieldDefinition(rowIndex: number): void {
    const data: FieldDefinitionModel = this._getTableItem(rowIndex);
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this field?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.props.deleteFieldDefinition(data.id)}
      />
    );
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Data Type',
      field: 'fieldType',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) =>
        value?.label && value.label === 'TIME' ? 'ZULU TIME' : value.label || '',
    },
    {
      headerName: 'Display Name',
      field: 'displayName',
    },
    {
      headerName: 'Variable Name',
      field: 'variableName',
    },
    {
      headerName: 'Is Required',
      field: 'required',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
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
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  private get gridActionProps(): object {
    return {
      showDeleteButton: true,
      getDisabledState: () => this.hasError,
      getEditableState: () => false,
      onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
    };
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: false,
      gridActionProps: this.gridActionProps,
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
        minWidth: 180,
      },

      frameworkComponents: {
        actionRenderer: AgGridActions,
        checkBoxRenderer: AgGridCheckBox,
      },
    };
  }

  public render(): ReactNode {
    const { classes, openEventTypeFieldDialog } = this.props as Required<Props>;
    return (
      <div className={classes.container}>
        <ChildGridWrapper
          onAdd={() => openEventTypeFieldDialog(new FieldDefinitionModel(), VIEW_MODE.NEW)}
          hasAddPermission={true}
          disabled={this.isProcessing}
        >
          <CustomAgGridReact
            isRowEditing={this.isRowEditing}
            rowData={this.props.fieldDefinitions}
            gridOptions={this.gridOptions}
          />
        </ChildGridWrapper>
      </div>
    );
  }
}

export default withStyles(styles)(FieldDefinitionGrid);
export { FieldDefinitionGrid as PureFieldDefinitionGrid };
