import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { BaseGrid, AgGridActions, AgGridCheckBox, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import {
  withRouter,
  Utilities,
  UIStore,
  IClasses,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import { DELIVERY_TYPE, TemplateModel, TemplateStore, TEMPLATE_FILTERS } from '../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { observer, inject } from 'mobx-react';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { action } from 'mobx';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles } from '@material-ui/core';
import { styles } from './Template.styles';
import { NavigateFunction } from 'react-router';
import { CustomLinkButton, ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';

interface Props {
  classes?: IClasses;
  templateStore: TemplateStore;
  navigate: NavigateFunction;
}

const filtersSetup: IBaseGridFilterSetup<TEMPLATE_FILTERS> = {
  defaultPlaceHolder: 'Search by Name',
  filterTypesOptions: Object.values(TEMPLATE_FILTERS),
  defaultFilterType: TEMPLATE_FILTERS.NAME,
};

@inject('templateStore')
@observer
class Template extends BaseGrid<Props, TemplateModel> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  private loadInitialData(): void {
    UIStore.setPageLoader(true);

    this.props.templateStore
      .getTemplates()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(templates => (this.data = templates));
  }

  /* istanbul ignore next */
  private removeTemplate(rowIndex: number): void {
    ModalStore.close();
    const eventType: TemplateModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.templateStore
      .removeTemplate(eventType)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          this._removeTableItems([ eventType ]);
          this.data = this._getAllTableRows();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 150,
    },
    {
      headerName: 'Delivery Type',
      field: 'deliveryTypeName',
    },
    {
      headerName: 'Channel',
      field: 'channel',
      minWidth: 150,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'EventType',
      field: 'eventType',
      minWidth: 150,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Description',
      field: 'description',
    },
    {
      headerName: 'Default Template',
      field: 'defaultTemplate',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      sortable: false,
      filter: false,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node: RowNode) => [
          {
            title: 'Edit',
            isHidden: false,
            action: GRID_ACTIONS.EDIT,
            to: node => `/notifications/templates/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Delete',
            isHidden: false,
            action: GRID_ACTIONS.DELETE,
          },
          {
            title: 'Preview',
            isHidden: !(
              node.data.channel?.type?.id == DELIVERY_TYPE.EMAIL || node.data.channel?.type?.id == DELIVERY_TYPE.SMS
            ),
            action: GRID_ACTIONS.PREVIEW,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => this.gridActions(action, rowIndex, node),
      },
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      doesExternalFilterPass: node => {
        const { name } = node.data as TemplateModel;
        return (
          !name ||
          this._isFilterPass({
            [TEMPLATE_FILTERS.NAME]: name,
          })
        );
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        checkBoxRenderer: AgGridCheckBox,
      },
    };
  }

  private get rightContent(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <>
        <div className={classes.emailRootBtn}>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={`email-root/${VIEW_MODE.EDIT.toLowerCase()}`}
            title="Email Root Template"
            disabled={this.isProcessing}
          />
        </div>
        <div>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={VIEW_MODE.NEW.toLowerCase()}
            title="Add Template"
            disabled={this.isProcessing}
          />
        </div>
      </>
    );
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number, node: RowNode): void {
    if (rowIndex === null) {
      return;
    }
    if (Utilities.isEqual(gridAction, GRID_ACTIONS.DELETE)) {
      this.confirmRemoveTemplate(rowIndex);
    }
    if (Utilities.isEqual(gridAction, GRID_ACTIONS.PREVIEW)) {
      if (node.data?.sendGridTemplateId) {
        AlertStore.info(`Preview this template on Sendgrid template id: ${node.data?.sendGridTemplateId}`);
      } else {
        this.props.navigate(`/notifications/templates/preview/${node.data?.id}`);
      }
    }
  }

  @action
  private confirmRemoveTemplate(rowIndex: number): void {
    const model: TemplateModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Template?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.removeTemplate(rowIndex)}
      />
    );
  }

  render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as TEMPLATE_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
          isHideSearchSelectControl={true}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default withRouter(withStyles(styles)(Template));
export { Template as PureTemplate };
