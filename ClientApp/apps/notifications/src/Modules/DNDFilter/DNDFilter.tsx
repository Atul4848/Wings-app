import { DNDFilterStore, DNDFilterModel, DND_FILTERS, MessageLevelModel } from '../Shared';
import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { BaseGrid, CustomAgGridReact, AgGridActions, AgGridCheckBox } from '@wings-shared/custom-ag-grid';
import { inject, observer } from 'mobx-react';
import { withTheme } from '@material-ui/core';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { finalize, takeUntil } from 'rxjs/operators';
import { action } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  DATE_FORMAT,
  ISelectOption,
  UIStore,
  Utilities,
  withRouter,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import { CustomLinkButton, ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';

interface Props {
  dndFilterStore: DNDFilterStore;
}

const filtersSetup: IBaseGridFilterSetup<DND_FILTERS> = {
  defaultPlaceHolder: 'Search by Name, Start Time, Stop Time, Level, Filter Type or Okta Username',
  filterTypesOptions: Object.values(DND_FILTERS),
  defaultFilterType: DND_FILTERS.Name,
};

@inject('dndFilterStore')
@observer
class DNDFilter extends BaseGrid<Props, DNDFilterModel, DND_FILTERS> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  private loadInitialData() {
    UIStore.setPageLoader(true);
    this.props.dndFilterStore
      .getDNDFilters()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(dndFilters => (this.data = dndFilters));
  }

  /* istanbul ignore next */
  private removeDNDFilter(rowIndex: number): void {
    ModalStore.close();
    const dndFilter: DNDFilterModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.dndFilterStore
      .removeDNDFilter(dndFilter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this._removeTableItems([ dndFilter ]);
            this.data = this._getAllTableRows();
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
    },
    {
      headerName: 'UTC Start Time',
      field: 'startTime',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_TIME_FORMAT),
    },
    {
      headerName: 'UTC Stop Time',
      field: 'stopTime',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_TIME_FORMAT),
    },
    {
      headerName: 'Level',
      field: 'level',
      comparator: (current: MessageLevelModel, next: MessageLevelModel) =>
        Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Filter Type',
      field: 'filterType',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Enabled',
      field: 'isEnabled',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Okta User',
      field: 'oktaUsername',
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
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
            to: node => `/notifications/dndFilters/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Delete',
            isHidden: false,
            action: GRID_ACTIONS.DELETE,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
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
        const { id, name, startTime, stopTime, level, filterType, oktaUsername } = node.data as DNDFilterModel;
        return (
          !id ||
          this._isFilterPass({
            [DND_FILTERS.Name]: name,
            [DND_FILTERS.START_TIME]: Utilities.getformattedDate(startTime, DATE_FORMAT.API_TIME_FORMAT),
            [DND_FILTERS.STOP_TIME]: Utilities.getformattedDate(stopTime, DATE_FORMAT.API_TIME_FORMAT),
            [DND_FILTERS.LEVEL]: level.value,
            [DND_FILTERS.FILTER_TYPE]: filterType.label,
            [DND_FILTERS.OKTA_USERNAME]: oktaUsername,
          })
        );
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        checkBoxRenderer: AgGridCheckBox,
      },
    };
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    if (Utilities.isEqual(gridAction, GRID_ACTIONS.DELETE)) {
      this.confirmRemoveDNDFilter(rowIndex);
    }
  }

  @action
  private confirmRemoveDNDFilter(rowIndex: number): void {
    const model: DNDFilterModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this dnd filter?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.removeDNDFilter(rowIndex)}
      />
    );
  }

  private get rightContent(): ReactNode {
    return (
      <CustomLinkButton
        variant="contained"
        startIcon={<AddIcon />}
        to={VIEW_MODE.NEW.toLowerCase()}
        title="Add DND Filter"
        disabled={this.isProcessing}
      />
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as DND_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default withRouter(withTheme(DNDFilter));
export { DNDFilter as PureDNDFilter };
