import React, { ChangeEvent, ReactNode, RefObject } from 'react';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Checkbox, FormControlLabel, withStyles } from '@material-ui/core';
import { AgGridSwitch, BaseGrid, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { DATE_FORMAT, IClasses, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { SubscriptionStore, UserSubscriptionModel } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { styles } from './SearchSubscription.styles';
import { SearchInputControl } from '@wings-shared/form-controls';

interface Props {
  classes: IClasses;
  subscriptionStore?: SubscriptionStore;
  searchContact: string;
}

@inject('subscriptionStore')
@observer
class SearchSubscription extends BaseGrid<Props, UserSubscriptionModel> {
  private searchInputRef: RefObject<{ setInputValue: Function }> = React.createRef();
  @observable private search: string = '';
  @observable private isEnabled: boolean = false;
  @observable private includeInactive: boolean = false;
  @observable private showGrid: boolean = false;

  constructor(props) {
    super(props);
  }

  componentDidMount(): void {
    if (this.props.searchContact) {
      this.searchInputRef.current?.setInputValue(this.props.searchContact);
      this.search = this.props.searchContact;
      this.searchSubscriptions('enter');
    }
  }

  /* istanbul ignore next */
  @action
  private searchSubscriptions(key: string): void {
    const { subscriptionStore } = this.props;
    if (!Utilities.isEqual(key.toLowerCase(), 'enter')) {
      return;
    }

    UIStore.setPageLoader(true);
    subscriptionStore
      ?.searchSubscriptions(this.search as string, this.isEnabled, this.includeInactive)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((subscriptions: UserSubscriptionModel[]) => {
        this.showGrid = true;
        this.data = subscriptions;
      });
  }

  /* istanbul ignore next */
  private colDefs: ColDef[] = [
    {
      headerName: 'Enable/Disable',
      field: 'isEnabled',
      cellRenderer: 'switchRenderer',
      cellRendererParams: {
        isReadOnly: true,
      },
    },
    {
      headerName: 'Customer Number',
      field: 'customerNumber',
    },
    {
      headerName: 'Event Type',
      field: 'eventTypeName',
    },
    {
      headerName: 'Category',
      field: 'subscriptionCategory',
    },
    {
      headerName: 'Subscription Type',
      field: 'subscriptionType',
    },
    {
      headerName: 'Contact Name',
      field: 'contactName',
    },
    {
      headerName: 'Contact Value',
      field: 'contactValue',
    },
    {
      headerName: 'Verification Status',
      field: 'status',
    },
    {
      headerName: 'Deleted On',
      field: 'deletedOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    return {
      ...this._gridOptionsBase({
        context: this,
        columnDefs: this.colDefs,
        isEditable: false,
      }),
      frameworkComponents: {
        switchRenderer: AgGridSwitch,
      },
    };
  }

  @action
  private setSearchValue(searchValue: string): void {
    if (!searchValue) {
      this.data = [];
      this.isEnabled = false;
      this.includeInactive = false;
      this.showGrid = false;
    }
    this.search = searchValue;
  }

  @action
  private showEnabledOnly(event: ChangeEvent<HTMLInputElement>): void {
    this.isEnabled = event.target.checked;
    this.searchSubscriptions('enter');
  }

  @action
  private showInactive(event: ChangeEvent<HTMLInputElement>): void {
    this.includeInactive = event.target.checked;
    this.searchSubscriptions('enter');
  }

  render(): ReactNode {
    const { classes } = this.props;
    return (
      <>
        <div className={classes.root}>
          <div className={classes.searchFieldSection}>
            <SearchInputControl
              ref={this.searchInputRef}
              onSearch={(searchValue: string) => this.setSearchValue(searchValue)}
              onKeyUp={key => this.searchSubscriptions(key)}
              placeHolder="Search By Customer number, Contact name, Contact value or Status"
            />
            <div>
              <FormControlLabel
                disabled={!Boolean(this.showGrid)}
                control={<Checkbox checked={this.isEnabled} onChange={e => this.showEnabledOnly(e)} />}
                label="Is Enabled"
              />
            </div>
            <div>
              <FormControlLabel
                disabled={!Boolean(this.showGrid)}
                control={<Checkbox checked={this.includeInactive} onChange={e => this.showInactive(e)} />}
                label="Include Inactive"
              />
            </div>
          </div>
          <ViewPermission hasPermission={Boolean(this.showGrid)}>
            <div className={classes.gridContainer}>
              <div className={classes.mainContent}>
                <CustomAgGridReact
                  isRowEditing={this.isRowEditing}
                  rowData={this.data}
                  gridOptions={this.gridOptions}
                />
              </div>
            </div>
          </ViewPermission>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(SearchSubscription);
